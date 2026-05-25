import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const MOCK_GEO = [
  { estado: "Ciudad de México", leads: 621 },
  { estado: "Jalisco", leads: 487 },
  { estado: "Nuevo León", leads: 392 },
  { estado: "Quintana Roo", leads: 318 },
  { estado: "Puebla", leads: 241 },
  { estado: "Estado de México", leads: 198 },
  { estado: "Querétaro", leads: 156 },
  { estado: "Yucatán", leads: 134 },
];

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const { data, error } = await supabase.rpc("get_hubspot_geo_breakdown");
    if (error || !data) return NextResponse.json({ ok: true, data: MOCK_GEO });
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: true, data: MOCK_GEO });
  }
}
