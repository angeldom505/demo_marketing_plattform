// Sync incremental HubSpot → Supabase (cron diario 7am + botón manual).
// Usa cursor por hs_object_id para evitar el límite de 10K.
// Checkpoint guardado en hubspot_sync_log para sobrevivir el timeout de Vercel.

import { createClient } from "@supabase/supabase-js";
import { searchWithCursor, type HsContact } from "./client";

const UPSERT_BATCH = 200;
const TIME_CAP_MS  = 45_000; // Vercel Hobby mata a los 60s — salimos a los 45s

// ── Parsers ────────────────────────────────────────────────────────

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
export function mapContact(c: HsContact): Record<string, unknown> {
  const p = c.properties;
  return {
    id:                          c.id,
    firstname:                   p.firstname ?? null,
    lastname:                    p.lastname ?? null,
    apellido_materno:            p.apellido_materno ?? null,
    gender:                      p.gender ?? null,
    fecha_de_nacimiento:         toDateOnly(p.fecha_de_nacimiento),
    marital_status:              p.marital_status ?? null,
    city:                        p.city ?? null,
    municipio:                   p.municipio_contacto ?? null,
    colonia:                     p.colonia_contacto ?? null,
    country:                     p.country ?? null,
    hs_state_code:               p.hs_state_code ?? null,
    hs_country_region_code:      p.hs_country_region_code ?? null,
    ip_country:                  p.ip_country ?? null,
    ip_country_code:             p.ip_country_code ?? null,
    ip_state_code:               p.ip_state_code ?? null,
    desarrollo:                  p.desarrollo ?? null,
    desarrollo_interes:          p.desarrollo_interes_compra_contacto ?? null,
    modelo:                      p.modelo ?? null,
    modelo_comercial:            p.modelo_comercial ?? null,
    capacidad_compra:            toNum(p.capacidad_compra_contacto),
    capacidad_maxima_bancaria:   toNum(p.capacidad_maxima_bancaria_contacto),
    canal_de_captacion:          p.canal_de_captacion ?? null,
    canal_de_captacion_v2:       p.canal_de_captacion_v2 ?? null,
    subcanales_de_captacion:     p.subcanales_de_captacion ?? null,
    lifecyclestage:              p.lifecyclestage ?? null,
    hs_analytics_source:         p.hs_analytics_source ?? null,
    hs_analytics_source_data_1:  p.hs_analytics_source_data_1 ?? null,
    hs_analytics_source_data_2:  p.hs_analytics_source_data_2 ?? null,
    hs_latest_source_data_1:     p.hs_latest_source_data_1 ?? null,
    hs_latest_source_data_2:     p.hs_latest_source_data_2 ?? null,
    utm_source:                  p.utm_source ?? null,
    utm_medium:                  p.utm_medium ?? null,
    utm_campaign:                p.utm_campaign ?? null,
    utm_content:                 p.utm_content ?? null,
    utm_term:                    p.utm_term ?? null,
    hs_object_source_label:      p.hs_object_source_label ?? null,
    hs_object_source_detail_1:   p.hs_object_source_detail_1 ?? null,
    hs_object_source_detail_2:   p.hs_object_source_detail_2 ?? null,
    hs_object_source_detail_3:   p.hs_object_source_detail_3 ?? null,
    first_conversion_event_name: p.first_conversion_event_name ?? null,
    hs_analytics_first_url:      p.hs_analytics_first_url ?? null,
    createdate:                  toDate(p.createdate),
    lastmodifieddate:            toDate(p.lastmodifieddate),
    synced_at:                   new Date().toISOString(),
  };
}

// ── Cliente Supabase ───────────────────────────────────────────────

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function upsertBatch(
  supabase: ReturnType<typeof makeSupabase>,
  rows: Record<string, unknown>[]
): Promise<void> {
  const map = new Map<string, Record<string, unknown>>();
  for (const r of rows) map.set(r.id as string, r);
  const { error } = await supabase
    .from("hubspot_contactos")
    .upsert(Array.from(map.values()), { onConflict: "id" });
  if (error) throw new Error(`Supabase upsert: ${error.message}`);
}

// ── Tipos de retorno ───────────────────────────────────────────────

export type SyncResult = {
  synced:      number;
  duration_ms: number;
  synced_at:   string;
  partial:     boolean;
};

// ── Sync incremental ──────────────────────────────────────────────
//
// Cron diario: trae contactos modificados desde el último sync.
// Si Vercel mata la función a los 60s, el cursor queda guardado
// en hubspot_sync_log.last_contact_id y la siguiente invocación
// retoma desde ahí (via after() en el route handler).
//
// Cursor: hs_object_id GT last_contact_id (no usa "after" de paginación).
export async function runIncrementalSync(token: string): Promise<SyncResult> {
  const supabase = makeSupabase();
  const start    = Date.now();

  const { data: log } = await supabase
    .from("hubspot_sync_log")
    .select("last_sync_at, total_contacts, last_contact_id, contacts_status")
    .eq("id", 1)
    .single();

  const sinceMs = log?.last_sync_at
    ? new Date(log.last_sync_at).getTime() - 60_000
    : new Date("2021-01-01T00:00:00Z").getTime();

  // Si ya hay un cursor activo (invocación encadenada), retomarlos.
  // Si es un sync nuevo, limpiar el cursor.
  const isResume = log?.contacts_status === "syncing" && log?.last_contact_id;
  const cursorId = isResume ? log.last_contact_id : null;

  if (!isResume) {
    await supabase.from("hubspot_sync_log")
      .update({ status: "syncing", contacts_status: "syncing", last_contact_id: null })
      .eq("id", 1);
  }

  let synced    = 0;
  let batch: Record<string, unknown>[] = [];
  let lastId    = cursorId;
  let partial   = false;

  const modFilter = {
    propertyName: "lastmodifieddate",
    operator: "GTE",
    value: String(sinceMs),
  };

  try {
    for await (const page of searchWithCursor(token, [modFilter], cursorId)) {
      for (const c of page) {
        batch.push(mapContact(c));
        if (c.id > (lastId ?? "0")) lastId = c.id;
      }

      if (batch.length >= UPSERT_BATCH) {
        await upsertBatch(supabase, batch);
        synced += batch.length;
        batch = [];

        await supabase.from("hubspot_sync_log").update({
          last_contact_id: lastId,
          status: "syncing",
        }).eq("id", 1);

        if (Date.now() - start > TIME_CAP_MS) {
          partial = true;
          break;
        }
      }
    }

    if (batch.length > 0) {
      await upsertBatch(supabase, batch);
      synced += batch.length;
    }

    const { count } = await supabase
      .from("hubspot_contactos")
      .select("id", { count: "exact", head: true });

    await supabase.from("hubspot_sync_log").update({
      last_sync_at:    partial ? undefined : new Date().toISOString(),
      last_contact_id: partial ? lastId : null,
      contacts_status: partial ? "syncing" : "done",
      total_contacts:  count ?? 0,
      status:          partial ? "syncing" : "done",
      error_message:   null,
    }).eq("id", 1);

  } catch (err) {
    await supabase.from("hubspot_sync_log").update({
      status:        "error",
      error_message: String(err),
    }).eq("id", 1);
    throw err;
  }

  return {
    synced,
    duration_ms: Date.now() - start,
    synced_at:   new Date().toISOString(),
    partial,
  };
}
