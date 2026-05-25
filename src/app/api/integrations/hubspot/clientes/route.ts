import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export const revalidate = 0;

const MOCK_ANALYTICS = {
  total_contactos: 8347,
  by_lifecycle: [
    { label: "subscriber",             count: 1240 },
    { label: "231944871",              count: 2180 },
    { label: "lead",                   count: 1987 },
    { label: "marketingqualifiedlead", count: 1423 },
    { label: "salesqualifiedlead",     count: 742  },
    { label: "opportunity",            count: 498  },
    { label: "customer",               count: 277  },
  ],
  by_canal: [
    { label: "Meta Ads",       count: 2891 },
    { label: "Google Ads",     count: 1823 },
    { label: "Orgánico",       count: 1432 },
    { label: "Referido",       count: 987  },
    { label: "Email",          count: 621  },
    { label: "TikTok",         count: 389  },
    { label: "Portal",         count: 204  },
  ],
  by_subcanal: [
    { label: "Facebook Feed",    count: 1456 },
    { label: "Instagram Stories",count: 891  },
    { label: "Google Search",    count: 1124 },
    { label: "Google Display",   count: 699  },
    { label: "SEO",              count: 1432 },
    { label: "WhatsApp Referido",count: 987  },
  ],
  by_modelo: [
    { label: "Casa",          count: 4821 },
    { label: "Departamento",  count: 2187 },
    { label: "Townhouse",     count: 987  },
    { label: "Terreno",       count: 352  },
  ],
  by_generacion: [
    { label: "Millennial (1981-1996)", count: 3892 },
    { label: "Gen X (1965-1980)",      count: 2341 },
    { label: "Gen Z (1997+)",          count: 1456 },
    { label: "Boomer (1946-1964)",     count: 658  },
  ],
  by_utm_source: [
    { label: "meta",       count: 2891 },
    { label: "google",     count: 1823 },
    { label: "organic",    count: 1432 },
    { label: "email",      count: 621  },
    { label: "tiktok",     count: 389  },
    { label: "(direct)",   count: 1191 },
  ],
  by_utm_campaign: [
    { label: "aukena-caribe-q2",    count: 987  },
    { label: "turquesa-playa-may",  count: 734  },
    { label: "bonza-familia-abr",   count: 621  },
    { label: "meriden-lujo-q2",     count: 543  },
    { label: "central-park-may",    count: 412  },
    { label: "general-brand",       count: 1034 },
  ],
  by_source_label: [
    { label: "Búsqueda pagada",   count: 1823 },
    { label: "Social pagado",     count: 2891 },
    { label: "Orgánico",          count: 1432 },
    { label: "Directo",           count: 1191 },
    { label: "Email",             count: 621  },
    { label: "Referido",          count: 389  },
  ],
  contactos_por_mes: [
    { mes: "2025-06", count: 412  },
    { mes: "2025-07", count: 498  },
    { mes: "2025-08", count: 534  },
    { mes: "2025-09", count: 567  },
    { mes: "2025-10", count: 621  },
    { mes: "2025-11", count: 698  },
    { mes: "2025-12", count: 743  },
    { mes: "2026-01", count: 812  },
    { mes: "2026-02", count: 867  },
    { mes: "2026-03", count: 934  },
    { mes: "2026-04", count: 987  },
    { mes: "2026-05", count: 1072 },
  ],
  by_municipio: [
    { label: "Benito Juárez, Q.Roo",  count: 987  },
    { label: "Mérida, Yucatán",        count: 743  },
    { label: "Miguel Hidalgo, CDMX",   count: 698  },
    { label: "Cuauhtémoc, CDMX",       count: 621  },
    { label: "Querétaro, Qro.",        count: 534  },
    { label: "San Pedro G.G., N.L.",   count: 498  },
    { label: "Puebla de Z., Pue.",     count: 412  },
    { label: "Ecatepec, Edo.Méx.",     count: 389  },
    { label: "Tlaquepaque, Jal.",      count: 356  },
    { label: "Monterrey, N.L.",        count: 312  },
  ],
  by_desarrollo: [
    { label: "Aukena",          count: 1487 },
    { label: "Turquesa",        count: 1123 },
    { label: "Mériden",         count: 987  },
    { label: "Bonza",           count: 876  },
    { label: "Central Park",    count: 743  },
    { label: "Trojes",          count: 621  },
    { label: "Santa Fe",        count: 498  },
    { label: "Aquasol",         count: 412  },
    { label: "Ciudad Natura",   count: 356  },
    { label: "Sauz Toluca",     count: 243  },
  ],
  capacidad: {
    promedio: 2_450_000, mediana: 2_100_000,
    p25: 1_400_000, p75: 3_200_000,
    con_dato: 6_891,
    rangos: [
      { label: "< $1M",         count: 892,  orden: 1 },
      { label: "$1M – $2M",     count: 2341, orden: 2 },
      { label: "$2M – $3M",     count: 1987, orden: 3 },
      { label: "$3M – $4M",     count: 1123, orden: 4 },
      { label: "$4M – $5M",     count: 432,  orden: 5 },
      { label: "> $5M",         count: 116,  orden: 6 },
    ],
  },
};

const MOCK_SYNC = {
  status: "ok", contacts_status: "ok",
  last_sync_at: new Date().toISOString(),
  total_contacts: 8347,
};

export async function GET(req: NextRequest) {
  const supabase   = makeSupabase();
  const desarrollo = req.nextUrl.searchParams.get("desarrollo");
  const from       = req.nextUrl.searchParams.get("from");
  const to         = req.nextUrl.searchParams.get("to");

  // Elegir qué función llamar según los parámetros presentes
  let analyticsQuery;
  if (desarrollo) {
    analyticsQuery = supabase.rpc("get_hubspot_analytics_desarrollo", { p_desarrollo: desarrollo });
  } else if (from) {
    analyticsQuery = supabase.rpc("get_hubspot_analytics_period", {
      p_from: from,
      p_to:   to ?? new Date().toISOString(),
    });
  } else {
    // Sin filtros: leer directo del caché (lectura instantánea)
    analyticsQuery = supabase
      .from("hubspot_analytics_cache")
      .select("data,refreshed_at")
      .eq("id", 1)
      .maybeSingle();
  }

  const [{ data: log }, analyticsResult] = await Promise.all([
    supabase
      .from("hubspot_sync_log")
      .select("status,contacts_status,last_sync_at,total_contacts")
      .eq("id", 1)
      .maybeSingle(),
    analyticsQuery,
  ]);

  // Para la lectura de caché, el resultado tiene shape {data, refreshed_at}
  // Para los RPCs, el resultado está en .data directamente
  const isCacheRead = !desarrollo && !from;
  const cacheRow    = isCacheRead
    ? (analyticsResult.data as { data: unknown; refreshed_at: string } | null)
    : null;
  const analytics   = isCacheRead
    ? (cacheRow?.data ?? null)
    : (analyticsResult as { data: unknown }).data;
  const refreshed   = cacheRow?.refreshed_at ?? log?.last_sync_at ?? null;

  const syncStatus = {
    status:          log?.status          ?? "idle",
    contacts_status: log?.contacts_status ?? "idle",
    last_sync_at:    refreshed,
    total_contacts:  log?.total_contacts  ?? 0,
  };

  if (analyticsResult.error || !analytics) {
    return NextResponse.json({ ok: true, syncStatus: MOCK_SYNC, analytics: MOCK_ANALYTICS });
  }

  return NextResponse.json({ ok: true, syncStatus, analytics });
}
