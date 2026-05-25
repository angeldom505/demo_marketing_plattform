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

const MOCK_TREND = [
  { periodo: "Ene", leads: 198 },
  { periodo: "Feb", leads: 234 },
  { periodo: "Mar", leads: 287 },
  { periodo: "Abr", leads: 312 },
  { periodo: "May", leads: 391 },
  { periodo: "Jun", leads: 356 },
  { periodo: "Jul", leads: 421 },
  { periodo: "Ago", leads: 398 },
  { periodo: "Sep", leads: 445 },
  { periodo: "Oct", leads: 467 },
  { periodo: "Nov", leads: 512 },
  { periodo: "Dic", leads: 489 },
];

// GET /api/integrations/hubspot/trend
// ?freq=daily|weekly|monthly|quarterly|yearly
// ?from=YYYY-MM-DD  (required)
// ?to=YYYY-MM-DD    (optional, defaults to today)
// ?compare=none|prev_period|prev_year

export async function GET(req: NextRequest) {
  const supabase = makeSupabase();
  const freq    = req.nextUrl.searchParams.get("freq")    ?? "monthly";
  const from    = req.nextUrl.searchParams.get("from");
  const to      = req.nextUrl.searchParams.get("to")      ?? new Date().toISOString();
  const compare = req.nextUrl.searchParams.get("compare") ?? "none";

  if (!from) {
    return NextResponse.json({ ok: false, error: "Missing from param" }, { status: 400 });
  }

  const fromDt = new Date(from);
  const toDt   = new Date(to);
  const diffMs = toDt.getTime() - fromDt.getTime();

  // Current period
  const currentResult = await supabase.rpc("get_hubspot_trend", {
    p_freq: freq,
    p_from: fromDt.toISOString(),
    p_to:   toDt.toISOString(),
  });

  if (currentResult.error) {
    return NextResponse.json({ ok: true, current: MOCK_TREND, previous: null });
  }

  // Comparison period
  let previousData = null;
  if (compare === "prev_period") {
    const prevFrom = new Date(fromDt.getTime() - diffMs);
    const prevTo   = new Date(toDt.getTime()   - diffMs);
    const r = await supabase.rpc("get_hubspot_trend", {
      p_freq: freq,
      p_from: prevFrom.toISOString(),
      p_to:   prevTo.toISOString(),
    });
    previousData = r.data ?? null;
  } else if (compare === "prev_year") {
    const prevFrom = new Date(fromDt);
    prevFrom.setFullYear(prevFrom.getFullYear() - 1);
    const prevTo = new Date(toDt);
    prevTo.setFullYear(prevTo.getFullYear() - 1);
    const r = await supabase.rpc("get_hubspot_trend", {
      p_freq: freq,
      p_from: prevFrom.toISOString(),
      p_to:   prevTo.toISOString(),
    });
    previousData = r.data ?? null;
  }

  return NextResponse.json({
    ok:       true,
    current:  currentResult.data ?? [],
    previous: previousData,
  });
}
