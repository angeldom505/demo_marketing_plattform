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
    return NextResponse.json({
      ok:       false,
      error:    analyticsResult.error?.message ?? "Sin datos",
      syncStatus,
      analytics: null,
    });
  }

  return NextResponse.json({ ok: true, syncStatus, analytics });
}
