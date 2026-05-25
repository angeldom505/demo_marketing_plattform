import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DESARROLLOS, CONTENT_TYPES } from "@/lib/data/desarrollos";

export async function POST(req: NextRequest) {
  const { tipo, desarrollo: desNombre, tono, audiencia, prompt } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurado. Agrega la clave en las variables de entorno de Vercel." },
      { status: 503 }
    );
  }

  const des = DESARROLLOS.find((d) => d.nombre === desNombre) || DESARROLLOS[0];
  const contentType = CONTENT_TYPES.find((t) => t.id === tipo)?.label || "Post Instagram";

  const systemPrompt = `Eres HU·GPT, el asistente de marketing inmobiliario de Hogares Unión.
Generas contenido diferenciado y auténtico para desarrollos residenciales mexicanos.
Responde siempre en español. Tono: ${tono || "Cálido"}. Sin tecnicismos innecesarios.
Audiencia objetivo: ${audiencia || "Familia joven CDMX"}.
El contenido debe ser inmediatamente usable — listo para publicar o enviar.`;

  const userPrompt = `Genera un ${contentType} para el desarrollo ${des.nombre}.

DATOS DEL DESARROLLO:
- Nombre: ${des.nombre}
- Región: ${des.region}, ${des.ciudad}
- Tipología: ${des.tipologia}
- Unidades: ${des.unidades}
- Materia prima: ficha=${des.ficha}, storytelling=${des.storytelling}, competencia=${des.competencia}, audiencias=${des.audiencias}
${prompt ? `\nBRIEF ADICIONAL:\n${prompt}` : ""}

Genera el contenido completo y listo para usar.`;

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
