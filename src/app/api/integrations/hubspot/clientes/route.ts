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
  total: 2847, nuevos_mes: 312, tasa_conversion: 4.7,
  por_fuente: [
    { fuente: "Meta Ads", leads: 987, pct: 34.7 },
    { fuente: "Google Ads", leads: 621, pct: 21.8 },
    { fuente: "Orgánico", leads: 487, pct: 17.1 },
    { fuente: "Referidos", leads: 392, pct: 13.8 },
    { fuente: "Email", leads: 241, pct: 8.5 },
    { fuente: "TikTok", leads: 119, pct: 4.2 },
  ],
  por_desarrollo: [
    { desarrollo: "Aukena", leads: 487, conversion: 6.2 },
    { desarrollo: "Turquesa", leads: 312, conversion: 4.1 },
    { desarrollo: "Mériden", leads: 289, conversion: 5.8 },
    { desarrollo: "Bonza", leads: 241, conversion: 3.9 },
    { desarrollo: "Central Park", leads: 198, conversion: 4.6 },
    { desarrollo: "Trojes", leads: 167, conversion: 3.2 },
  ],
};

const MOCK_SYNC = {
  status: "ok", contacts_status: "ok",
  last_sync_at: new Date().toISOString(),
  total_contacts: 2847,
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
