/**
 * Carga inicial de contactos HubSpot → Supabase
 *
 * Usa el list endpoint (sin límite de 10K) para traer todos los contactos
 * desde 2021. Corre localmente sin límite de tiempo.
 *
 * Uso:
 *   npx tsx scripts/hubspot-full-sync.ts
 *
 * Resumible: guarda el cursor en scripts/.sync_cursor.
 * Si se interrumpe, vuelve a correr y retoma desde donde quedó.
 *
 * Tiempo estimado: ~20 min para 1M contactos (rate limit: 120ms/req).
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ── Cargar .env.local ───────────────────────────────────────────────
function loadEnv() {
  const path = new URL("../.env.local", import.meta.url).pathname;
  try {
    for (const line of readFileSync(path, "utf-8").split("\n")) {
      const eq = line.indexOf("=");
      if (eq < 1 || line.startsWith("#")) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error("No se encontró .env.local — asegúrate de correr desde la raíz del proyecto");
    process.exit(1);
  }
}
loadEnv();

// ── Config ──────────────────────────────────────────────────────────
const HUBSPOT_TOKEN    = process.env.HUBSPOT_ACCESS_TOKEN!;
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CURSOR_FILE      = new URL(".sync_cursor", import.meta.url).pathname;
const SINCE_2021       = new Date("2021-01-01T00:00:00Z").getTime();
const BATCH_SIZE       = 500;
const PACE_MS          = 120;   // ~83 req/10s — cómodo bajo el límite de 100

if (!HUBSPOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan variables de entorno: HUBSPOT_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const BASE = "https://api.hubapi.com";

const HS_PROPERTIES = [
  "firstname", "lastname", "apellido_materno", "gender",
  "fecha_de_nacimiento", "marital_status",
  "city", "municipio_contacto", "colonia_contacto", "country", "ip_country",
  "desarrollo", "desarrollo_interes_compra_contacto",
  "modelo", "modelo_comercial",
  "capacidad_compra_contacto", "capacidad_maxima_bancaria_contacto",
  "lifecyclestage",
  "hs_lifecyclestage_lead_date",
  "hs_lifecyclestage_marketingqualifiedlead_date",
  "hs_lifecyclestage_salesqualifiedlead_date",
  "hs_lifecyclestage_opportunity_date",
  "hs_lifecyclestage_customer_date",
  "createdate", "lastmodifieddate",
  "hs_analytics_source",
  "canal_de_captacion", "canal_de_captacion_v2", "subcanales_de_captacion",
  "utm_source", "utm_medium", "utm_campaign",
].join(",");

// ── Helpers ─────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function toNum(v: string | null | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}

function toDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const ms = parseInt(v);
  if (!isNaN(ms) && ms > 1e10) return new Date(ms).toISOString();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function toDateOnly(v: string | null | undefined): string | null {
  if (!v) return null;
  const ms = parseInt(v);
  if (!isNaN(ms) && ms <= 0) return null;
  if (!isNaN(ms) && ms > 1e10) {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    if (y < 1900 || y > 2100) return null;
    return `${y}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  if (y < 1900 || y > 2100) return null;
  if (y === 1970 && d.getUTCMonth() === 0 && d.getUTCDate() === 1) return null;
  return v.slice(0, 10);
}

function mapContact(c: { id: string; properties: Record<string, string | null> }) {
  const p = c.properties;
  return {
    id:                        c.id,
    firstname:                 p.firstname ?? null,
    lastname:                  p.lastname ?? null,
    apellido_materno:          p.apellido_materno ?? null,
    gender:                    p.gender ?? null,
    fecha_de_nacimiento:       toDateOnly(p.fecha_de_nacimiento),
    marital_status:            p.marital_status ?? null,
    city:                      p.city ?? null,
    municipio:                 p.municipio_contacto ?? null,
    colonia:                   p.colonia_contacto ?? null,
    country:                   p.country ?? null,
    desarrollo:                p.desarrollo ?? null,
    desarrollo_interes:        p.desarrollo_interes_compra_contacto ?? null,
    modelo:                    p.modelo ?? null,
    modelo_comercial:          p.modelo_comercial ?? null,
    capacidad_compra:          toNum(p.capacidad_compra_contacto),
    capacidad_maxima_bancaria: toNum(p.capacidad_maxima_bancaria_contacto),
    lifecyclestage:            p.lifecyclestage ?? null,
    createdate:                toDate(p.createdate),
    lastmodifieddate:          toDate(p.lastmodifieddate),
    hs_analytics_source:       p.hs_analytics_source ?? null,
    canal_de_captacion:        p.canal_de_captacion ?? null,
    canal_de_captacion_v2:     p.canal_de_captacion_v2 ?? null,
    subcanales_de_captacion:   p.subcanales_de_captacion ?? null,
    utm_source:                p.utm_source ?? null,
    utm_medium:                p.utm_medium ?? null,
    utm_campaign:              p.utm_campaign ?? null,
    synced_at:                 new Date().toISOString(),
  };
}

// ── Cursor (para retomar si se interrumpe) ──────────────────────────
function loadCursor(): string | undefined {
  try { return readFileSync(CURSOR_FILE, "utf-8").trim() || undefined; } catch { return undefined; }
}
function saveCursor(cursor: string) {
  writeFileSync(CURSOR_FILE, cursor, "utf-8");
}
function clearCursor() {
  try { require("fs").unlinkSync(CURSOR_FILE); } catch {}
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  let cursor = loadCursor();
  const resuming = !!cursor;
  if (resuming) {
    console.log(`▶ Retomando desde cursor guardado...`);
  } else {
    console.log(`▶ Iniciando carga completa desde 2021...`);
  }
  console.log(`  Rate limit: ${PACE_MS}ms entre requests (~83 req/10s)`);
  console.log(`  Lotes de ${BATCH_SIZE} contactos a Supabase`);
  console.log(`  Para interrumpir: Ctrl+C (se puede retomar)\n`);

  const startTime = Date.now();
  let totalProcessed = 0;
  let totalInserted  = 0;
  let batch: ReturnType<typeof mapContact>[] = [];
  let reqCount = 0;

  await supabase.from("hubspot_sync_log").update({ status: "syncing" }).eq("id", 1);

  while (true) {
    // ── Fetch página de HubSpot ──────────────────────────────────
    const url = new URL(`${BASE}/crm/v3/objects/contacts`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("properties", HS_PROPERTIES);
    if (cursor) url.searchParams.set("after", cursor);

    await sleep(PACE_MS);
    reqCount++;

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` },
      });
    } catch (e) {
      console.error(`\nError de red en req #${reqCount}:`, e);
      console.log("Reintentando en 5s...");
      await sleep(5000);
      continue;
    }

    if (res.status === 429) {
      const wait = parseInt(res.headers.get("Retry-After") ?? "10") * 1000;
      console.log(`\nRate limited — esperando ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const txt = await res.text();
      console.error(`\nHubSpot ${res.status}: ${txt.slice(0, 200)}`);
      console.log("Reintentando en 10s...");
      await sleep(10000);
      continue;
    }

    const data = await res.json();
    const results = data.results ?? [];

    // Filtrar: solo contactos creados desde 2021
    for (const c of results) {
      const cd = parseInt(c.properties?.createdate ?? "0");
      if (cd < SINCE_2021) continue;
      batch.push(mapContact(c));
      totalProcessed++;
    }

    // ── Upsert cuando el lote está lleno ─────────────────────────
    if (batch.length >= BATCH_SIZE) {
      const seen = new Map<string, ReturnType<typeof mapContact>>();
      for (const r of batch) seen.set(r.id, r);

      const { error } = await supabase
        .from("hubspot_contactos")
        .upsert(Array.from(seen.values()), { onConflict: "id" });

      if (error) {
        console.error(`\nError Supabase:`, error.message);
        process.exit(1);
      }

      totalInserted += seen.size;
      batch = [];

      if (cursor) saveCursor(cursor);

      // Actualizar sync log
      await supabase.from("hubspot_sync_log").update({
        total_contacts: totalInserted,
        last_sync_at:   new Date().toISOString(),
      }).eq("id", 1);

      // Progreso
      const elapsed = (Date.now() - startTime) / 1000;
      const rate    = Math.round(totalInserted / elapsed);
      process.stdout.write(`\r  → ${totalInserted.toLocaleString()} insertados | ${rate} contactos/s | ${Math.round(elapsed)}s`);
    }

    // ── Siguiente página ─────────────────────────────────────────
    const nextCursor = data.paging?.next?.after;
    if (!nextCursor) break;
    cursor = nextCursor;
  }

  // Flush lote restante
  if (batch.length > 0) {
    const seen = new Map<string, ReturnType<typeof mapContact>>();
    for (const r of batch) seen.set(r.id, r);
    await supabase.from("hubspot_contactos").upsert(Array.from(seen.values()), { onConflict: "id" });
    totalInserted += seen.size;
  }

  // Marcar como completado
  await supabase.from("hubspot_sync_log").update({
    status:         "done",
    last_sync_at:   new Date().toISOString(),
    total_contacts: totalInserted,
    error_message:  null,
  }).eq("id", 1);

  clearCursor();

  const mins = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n\n✓ Carga completa: ${totalInserted.toLocaleString()} contactos en ${mins} min`);
  console.log(`  El cron de 7am mantiene los datos actualizados desde ahora.`);
}

main().catch(err => {
  console.error("\nError fatal:", err);
  process.exit(1);
});
