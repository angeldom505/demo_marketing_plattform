import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.rpc("get_hubspot_geo_breakdown");

  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message ?? "Sin datos", data: null });
  }

  return NextResponse.json({ ok: true, data });
}
