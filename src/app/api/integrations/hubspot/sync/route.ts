import { NextRequest, NextResponse, after } from "next/server";
import { runIncrementalSync } from "@/lib/hubspot/sync";

async function handler(req: NextRequest) {
  try {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "HUBSPOT_ACCESS_TOKEN no configurado en Vercel" }
      );
    }

    const result = await runIncrementalSync(token);

    // Si hay más datos, encadenar la siguiente invocación DESPUÉS de responder.
    // after() garantiza que la función siga viva tras enviar la respuesta.
    if (result.partial && result.synced > 0) {
      const origin = new URL(req.url).origin;
      after(async () => {
        await fetch(`${origin}/api/integrations/hubspot/sync`, { method: "POST" });
      });
    }

    return NextResponse.json({ ok: true, ...result });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[hubspot/sync]", msg);
    return NextResponse.json({ ok: false, error: msg });
  }
}

// GET: cron de Vercel (7am México)
// POST: botón manual o auto-encadenamiento
export const GET  = handler;
export const POST = handler;
