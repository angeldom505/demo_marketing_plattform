/**
 * Carga completa HubSpot → Supabase
 *
 * Técnica: cursor por hs_object_id (nunca toca el límite de 10K del offset)
 * Checkpoint: hubspot_sync_log en Supabase (reanuda si se interrumpe)
 * Rate limit: 150ms entre requests (~6 req/s)
 *
 * Uso:
 *   npx tsx scripts/hubspot-sync.ts              # contactos + negocios
 *   npx tsx scripts/hubspot-sync.ts --contacts   # solo contactos
 *   npx tsx scripts/hubspot-sync.ts --deals      # solo negocios
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// ── .env.local ─────────────────────────────────────────────────────
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
    console.error("No se encontró .env.local — corre desde la raíz del proyecto");
    process.exit(1);
  }
}
loadEnv();

const TOKEN = process.env.HUBSPOT_TOKEN ?? process.env.HUBSPOT_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!TOKEN)         { console.error("Falta HUBSPOT_TOKEN en .env.local");              process.exit(1); }
if (!SUPABASE_URL)  { console.error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");   process.exit(1); }
if (!SUPABASE_KEY)  { console.error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");  process.exit(1); }

// ── Config ─────────────────────────────────────────────────────────
const BASE          = "https://api.hubapi.com";
const PACE_MS       = 150;    // 150ms entre requests (~6 req/s, límite HubSpot: 10 req/s)
const UPSERT_BATCH  = 500;
const SINCE_2021    = 1609459200000; // 2021-01-01T00:00:00Z en ms

// ── Propiedades a extraer ──────────────────────────────────────────
const CONTACT_PROPS = [
  "firstname", "lastname", "apellido_materno", "email", "phone", "mobilephone",
  "gender", "marital_status", "fecha_de_nacimiento", "city", "zip",
  "colonia_contacto", "municipio_contacto", "country", "hs_state_code",
  "hs_country_region_code", "ip_country", "ip_country_code", "ip_state_code",
  "desarrollo", "desarrollo_interes_compra_contacto", "modelo_comercial",
  "modelo", "capacidad_compra_contacto", "capacidad_maxima_bancaria_contacto",
  "canal_de_captacion", "canal_de_captacion_v2", "subcanales_de_captacion",
  "lifecyclestage", "hs_analytics_source", "hs_analytics_source_data_1",
  "hs_analytics_source_data_2", "hs_latest_source_data_1", "hs_latest_source_data_2",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "hs_object_source_label", "hs_object_source_detail_1", "hs_object_source_detail_2",
  "hs_object_source_detail_3", "first_conversion_event_name",
  "hs_analytics_first_url", "createdate", "lastmodifieddate",
] as const;

const DEAL_PROPS = [
  "dealname", "dealstage", "amount", "closedate", "createdate",
  "desarrollo_negocio", "familiamodelo_negocio", "hs_object_source_label",
] as const;

// ── Parsers ────────────────────────────────────────────────────────
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

// ── Mapeo HubSpot → columnas Supabase ─────────────────────────────
type Props = Record<string, string | null>;

function mapContact(id: string, p: Props): Record<string, unknown> {
  return {
    id,
    firstname:                  p.firstname ?? null,
    lastname:                   p.lastname ?? null,
    apellido_materno:           p.apellido_materno ?? null,
    email:                      p.email ?? null,
    phone:                      p.phone ?? null,
    mobilephone:                p.mobilephone ?? null,
    gender:                     p.gender ?? null,
    marital_status:             p.marital_status ?? null,
    fecha_de_nacimiento:        toDateOnly(p.fecha_de_nacimiento),
    city:                       p.city ?? null,
    zip:                        p.zip ?? null,
    colonia:                    p.colonia_contacto ?? null,
    municipio:                  p.municipio_contacto ?? null,
    country:                    p.country ?? null,
    hs_state_code:              p.hs_state_code ?? null,
    hs_country_region_code:     p.hs_country_region_code ?? null,
    ip_country:                 p.ip_country ?? null,
    ip_country_code:            p.ip_country_code ?? null,
    ip_state_code:              p.ip_state_code ?? null,
    desarrollo:                 p.desarrollo ?? null,
    desarrollo_interes:         p.desarrollo_interes_compra_contacto ?? null,
    modelo:                     p.modelo ?? null,
    modelo_comercial:           p.modelo_comercial ?? null,
    capacidad_compra:           toNum(p.capacidad_compra_contacto),
    capacidad_maxima_bancaria:  toNum(p.capacidad_maxima_bancaria_contacto),
    canal_de_captacion:         p.canal_de_captacion ?? null,
    canal_de_captacion_v2:      p.canal_de_captacion_v2 ?? null,
    subcanales_de_captacion:    p.subcanales_de_captacion ?? null,
    lifecyclestage:             p.lifecyclestage ?? null,
    hs_analytics_source:        p.hs_analytics_source ?? null,
    hs_analytics_source_data_1: p.hs_analytics_source_data_1 ?? null,
    hs_analytics_source_data_2: p.hs_analytics_source_data_2 ?? null,
    hs_latest_source_data_1:    p.hs_latest_source_data_1 ?? null,
    hs_latest_source_data_2:    p.hs_latest_source_data_2 ?? null,
    utm_source:                 p.utm_source ?? null,
    utm_medium:                 p.utm_medium ?? null,
    utm_campaign:               p.utm_campaign ?? null,
    utm_content:                p.utm_content ?? null,
    utm_term:                   p.utm_term ?? null,
    hs_object_source_label:     p.hs_object_source_label ?? null,
    hs_object_source_detail_1:  p.hs_object_source_detail_1 ?? null,
    hs_object_source_detail_2:  p.hs_object_source_detail_2 ?? null,
    hs_object_source_detail_3:  p.hs_object_source_detail_3 ?? null,
    first_conversion_event_name: p.first_conversion_event_name ?? null,
    hs_analytics_first_url:     p.hs_analytics_first_url ?? null,
    createdate:                 toDate(p.createdate),
    lastmodifieddate:           toDate(p.lastmodifieddate),
    synced_at:                  new Date().toISOString(),
  };
}

function mapDeal(id: string, p: Props): Record<string, unknown> {
  return {
    id,
    dealname:               p.dealname ?? null,
    dealstage:              p.dealstage ?? null,
    amount:                 toNum(p.amount),
    closedate:              toDate(p.closedate),
    createdate:             toDate(p.createdate),
    desarrollo_negocio:     p.desarrollo_negocio ?? null,
    familiamodelo_negocio:  p.familiamodelo_negocio ?? null,
    hs_object_source_label: p.hs_object_source_label ?? null,
    synced_at:              new Date().toISOString(),
  };
}

// ── HubSpot search con retry ───────────────────────────────────────
async function hsSearch(
  object: "contacts" | "deals",
  body: object
): Promise<{ results: Array<{ id: string; properties: Props }> }> {
  let serverErrors = 0;
  // Rate limit (429): reintentos ilimitados — siempre esperar y continuar.
  // Errores 5xx: máximo 5 reintentos con backoff.
  while (true) {
    const res = await fetch(`${BASE}/crm/v3/objects/${object}/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      const wait = Math.max(parseInt(res.headers.get("Retry-After") ?? "15") * 1000, 15_000);
      process.stdout.write(`\nRate limited — esperando ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }
    if (res.status >= 500) {
      serverErrors++;
      if (serverErrors > 5) throw new Error(`HubSpot 5xx persistente después de ${serverErrors} reintentos`);
      await sleep(5000 * serverErrors);
      continue;
    }
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HubSpot ${res.status}: ${txt.slice(0, 300)}`);
    }
    return res.json();
  }
}

// ── Cursor por hs_object_id ────────────────────────────────────────
// Evita completamente el límite de 10K del offset.
// Primer request: sin filtro de ID.
// Siguientes: hs_object_id GT {último_id}, ordenado ASC.
async function* cursorSearch(
  object: "contacts" | "deals",
  props: readonly string[],
  filters: Array<{ propertyName: string; operator: string; value: string }>,
  startId?: string | null
): AsyncGenerator<Array<{ id: string; properties: Props }>> {
  let lastId = startId ?? null;

  while (true) {
    const allFilters = [
      ...filters,
      ...(lastId ? [{ propertyName: "hs_object_id", operator: "GT", value: lastId }] : []),
    ];

    await sleep(PACE_MS);
    const data = await hsSearch(object, {
      filterGroups: [{ filters: allFilters }],
      properties: [...props],
      sorts: [{ propertyName: "hs_object_id", direction: "ASCENDING" }],
      limit: 100,
    });

    if (!data.results?.length) break;
    yield data.results;
    lastId = data.results[data.results.length - 1].id;
    if (data.results.length < 100) break; // última página
  }
}

// ── Sync contactos ─────────────────────────────────────────────────
async function syncContacts(
  supabase: ReturnType<typeof createClient>,
  startId: string | null,
  initialTotal: number,
  sinceMs: number | null   // null = carga completa, número = delta desde esa fecha
) {
  const isDelta = sinceMs !== null;
  let total     = initialTotal;
  let upserted  = 0;
  let batch: Record<string, unknown>[] = [];
  const t0 = Date.now();

  const label = isDelta
    ? `delta desde ${new Date(sinceMs!).toISOString().slice(0,16)}`
    : (startId ? `reanudando desde ID ${startId} (${total.toLocaleString()} ya cargados)` : "inicio desde 2021");
  console.log(`\n▶ Contactos — ${label}`);

  await supabase.from("hubspot_sync_log")
    .update({ status: "syncing", contacts_status: "syncing" }).eq("id", 1);

  const filter = isDelta
    ? { propertyName: "lastmodifieddate", operator: "GTE", value: String(sinceMs) }
    : { propertyName: "createdate",       operator: "GTE", value: String(SINCE_2021) };

  for await (const page of cursorSearch("contacts", CONTACT_PROPS, [filter], isDelta ? null : startId)) {
    for (const c of page) batch.push(mapContact(c.id, c.properties));

    if (batch.length >= UPSERT_BATCH) {
      const { error } = await supabase.from("hubspot_contactos").upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`Supabase contactos: ${error.message}`);

      upserted += batch.length;
      const lastId = (batch[batch.length - 1] as { id: string }).id;
      batch = [];

      if (isDelta) {
        process.stdout.write(`\r  → ${upserted.toLocaleString()} actualizados | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      } else {
        total += upserted;
        upserted = 0;
        await supabase.from("hubspot_sync_log")
          .update({ last_contact_id: lastId, total_contacts: total }).eq("id", 1);
        process.stdout.write(`\r  → ${total.toLocaleString()} contactos | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }
  }

  // Flush final
  if (batch.length > 0) {
    const { error } = await supabase.from("hubspot_contactos").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Supabase contactos: ${error.message}`);
    upserted += batch.length;
    if (!isDelta) total += upserted;
  }

  if (isDelta) {
    const { count } = await supabase.from("hubspot_contactos").select("*", { count: "exact", head: true });
    await supabase.from("hubspot_sync_log").update({
      contacts_status: "done",
      total_contacts:  count ?? initialTotal,
      last_sync_at:    new Date().toISOString(),
    }).eq("id", 1);
    console.log(`\n✓ Contactos: ${upserted.toLocaleString()} actualizados en ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  } else {
    await supabase.from("hubspot_sync_log").update({
      contacts_status: "done",
      last_contact_id: null,
      total_contacts:  total,
      last_sync_at:    new Date().toISOString(),
    }).eq("id", 1);
    console.log(`\n✓ Contactos: ${total.toLocaleString()} en ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  }
}

// ── Sync negocios ──────────────────────────────────────────────────
async function syncDeals(
  supabase: ReturnType<typeof createClient>,
  startId: string | null,
  initialTotal: number,
  sinceMs: number | null
) {
  const isDelta = sinceMs !== null;
  let total     = initialTotal;
  let upserted  = 0;
  let batch: Record<string, unknown>[] = [];
  const t0 = Date.now();

  const label = isDelta
    ? `delta desde ${new Date(sinceMs!).toISOString().slice(0,16)}`
    : (startId ? `reanudando desde ID ${startId} (${total.toLocaleString()} ya cargados)` : "inicio desde 2021");
  console.log(`\n▶ Negocios — ${label}`);

  await supabase.from("hubspot_sync_log")
    .update({ deals_status: "syncing" }).eq("id", 1);

  const filter = isDelta
    ? { propertyName: "lastmodifieddate", operator: "GTE", value: String(sinceMs) }
    : { propertyName: "createdate",       operator: "GTE", value: String(SINCE_2021) };

  for await (const page of cursorSearch("deals", DEAL_PROPS, [filter], isDelta ? null : startId)) {
    for (const d of page) batch.push(mapDeal(d.id, d.properties));

    if (batch.length >= UPSERT_BATCH) {
      const { error } = await supabase.from("hubspot_negocios").upsert(batch, { onConflict: "id" });
      if (error) throw new Error(`Supabase negocios: ${error.message}`);

      upserted += batch.length;
      const lastId = (batch[batch.length - 1] as { id: string }).id;
      batch = [];

      if (isDelta) {
        process.stdout.write(`\r  → ${upserted.toLocaleString()} actualizados | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      } else {
        total += upserted;
        upserted = 0;
        await supabase.from("hubspot_sync_log")
          .update({ last_deal_id: lastId, total_deals: total }).eq("id", 1);
        process.stdout.write(`\r  → ${total.toLocaleString()} negocios | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }
  }

  if (batch.length > 0) {
    const { error } = await supabase.from("hubspot_negocios").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Supabase negocios: ${error.message}`);
    upserted += batch.length;
    if (!isDelta) total += upserted;
  }

  if (isDelta) {
    const { count } = await supabase.from("hubspot_negocios").select("*", { count: "exact", head: true });
    await supabase.from("hubspot_sync_log").update({
      deals_status: "done",
      total_deals:  count ?? initialTotal,
    }).eq("id", 1);
    console.log(`\n✓ Negocios: ${upserted.toLocaleString()} actualizados en ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  } else {
    await supabase.from("hubspot_sync_log").update({
      deals_status: "done",
      last_deal_id: null,
      total_deals:  total,
    }).eq("id", 1);
    console.log(`\n✓ Negocios: ${total.toLocaleString()} en ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const args         = process.argv.slice(2);
  const onlyContacts = args.includes("--contacts");
  const onlyDeals    = args.includes("--deals");
  const isDelta      = args.includes("--delta");

  const { data: log } = await supabase
    .from("hubspot_sync_log").select("*").eq("id", 1).single();

  // Modo delta: trae solo registros modificados desde la última sync (con 2h de margen)
  let sinceMs: number | null = null;
  if (isDelta) {
    const lastSync = log?.last_sync_at ? new Date(log.last_sync_at).getTime() : 0;
    sinceMs = lastSync > 0 ? lastSync - 2 * 3600 * 1000 : SINCE_2021;
  }

  // En modo delta no hay checkpoint de ID; en modo full, reanuda desde donde quedó
  const lastContactId = isDelta ? null : (log?.last_contact_id ?? null);
  const lastDealId    = isDelta ? null : (log?.last_deal_id    ?? null);

  console.log(`━━━ HubSpot ${isDelta ? "Delta" : "Full"} Sync → Supabase ━━━━━━━━━━━━━━━━━━━`);
  if (!isDelta && (lastContactId || lastDealId)) {
    console.log("Checkpoint encontrado — reanudando...");
    if (lastContactId) console.log(`  Contactos en: ${(log?.total_contacts ?? 0).toLocaleString()} → desde ID ${lastContactId}`);
    if (lastDealId)    console.log(`  Negocios en:  ${(log?.total_deals ?? 0).toLocaleString()} → desde ID ${lastDealId}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!onlyDeals)    await syncContacts(supabase, lastContactId, log?.total_contacts ?? 0, sinceMs);
  if (!onlyContacts) await syncDeals(supabase, lastDealId, log?.total_deals ?? 0, sinceMs);

  await supabase.from("hubspot_sync_log").update({ status: "done" }).eq("id", 1);
  console.log(`\n✓ Sync ${isDelta ? "delta" : "completo"}. Datos disponibles en humarketingsuite.com`);
}

main().catch(err => {
  console.error("\nError fatal:", err);
  process.exit(1);
});
