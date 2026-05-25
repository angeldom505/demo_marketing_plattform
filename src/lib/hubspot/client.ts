// HubSpot CRM v3 — cliente con cursor por hs_object_id.
// Evita completamente el límite de 10K del search offset.
// Rate limit: 150ms entre requests (~6 req/s, techo: 10 req/s).

const BASE    = "https://api.hubapi.com";
const PACE_MS = 150;

export const HS_PROPERTIES = [
  "firstname", "lastname", "apellido_materno",
  "gender", "fecha_de_nacimiento", "marital_status",
  "city", "municipio_contacto", "colonia_contacto", "country", "ip_country",
  "hs_state_code", "hs_country_region_code", "ip_country_code", "ip_state_code",
  "desarrollo", "desarrollo_interes_compra_contacto",
  "modelo", "modelo_comercial",
  "capacidad_compra_contacto", "capacidad_maxima_bancaria_contacto",
  "lifecyclestage",
  "hs_analytics_source", "hs_analytics_source_data_1", "hs_analytics_source_data_2",
  "hs_latest_source_data_1", "hs_latest_source_data_2",
  "canal_de_captacion", "canal_de_captacion_v2", "subcanales_de_captacion",
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "hs_object_source_label",
  "hs_object_source_detail_1", "hs_object_source_detail_2", "hs_object_source_detail_3",
  "first_conversion_event_name", "hs_analytics_first_url",
  "createdate", "lastmodifieddate",
] as const;

export type HsContact = {
  id: string;
  properties: Record<string, string | null>;
};

type SearchResponse = {
  results: HsContact[];
  total: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = 4): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      const wait = parseInt(res.headers.get("Retry-After") ?? "10") * 1000;
      console.warn(`[hs] Rate limited — esperando ${wait}ms`);
      await sleep(wait);
      continue;
    }
    if (res.status >= 500 && attempt < retries - 1) {
      await sleep(2_000 * (attempt + 1));
      continue;
    }
    return res;
  }
  throw new Error("HubSpot fetch falló después de reintentos");
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

// ── Cursor por hs_object_id ──────────────────────────────────────
//
// Técnica correcta para la Search API de HubSpot:
//   - Ordena por hs_object_id ASC
//   - Primer request: solo filtros de negocio
//   - Siguientes: agrega hs_object_id GT {último_id_del_lote_anterior}
//
// Nunca usa el cursor "after" de paginación (truena con 400 al superar 10K).
// Soporta millones de registros sin límite.
export async function* searchWithCursor(
  token: string,
  filters: Array<{ propertyName: string; operator: string; value: string }>,
  startId?: string | null
): AsyncGenerator<HsContact[]> {
  let lastId = startId ?? null;

  while (true) {
    const allFilters = [
      ...filters,
      ...(lastId ? [{ propertyName: "hs_object_id", operator: "GT", value: lastId }] : []),
    ];

    await sleep(PACE_MS);
    const res = await fetchWithRetry(`${BASE}/crm/v3/objects/contacts/search`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        filterGroups: [{ filters: allFilters }],
        properties: [...HS_PROPERTIES],
        sorts: [{ propertyName: "hs_object_id", direction: "ASCENDING" }],
        limit: 100,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HubSpot search ${res.status}: ${txt.slice(0, 200)}`);
    }

    const data: SearchResponse = await res.json();
    if (!data.results?.length) break;
    yield data.results;
    lastId = data.results[data.results.length - 1].id;
    if (data.results.length < 100) break; // última página
  }
}
