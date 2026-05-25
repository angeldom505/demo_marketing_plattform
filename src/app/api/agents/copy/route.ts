import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DESARROLLOS, CONTENT_TYPES } from "@/lib/data/desarrollos";

const DEMO_COPY: Record<string, string> = {
  post: `✨ Vivir bien no es un lujo, es una decisión.

En {DESARROLLO} encontramos el equilibrio perfecto entre diseño, naturaleza y comunidad. Cada espacio fue pensado para que tu día a día se sienta diferente desde el primer momento.

🏡 Amenidades de primer nivel
🌿 Áreas verdes diseñadas para respirar
📍 Ubicación estratégica con todo a tu alcance

¿Listo para dar el siguiente paso?

👉 Descubre tu nuevo hogar en el enlace de bio.

#VidaResidencial #HogarDeTusSueños #BienvenidoACasa #Inmobiliaria #DesarrolloResidencial`,

  carousel: `— Slide 1 —
¿Buscas el hogar perfecto?
Te presentamos {DESARROLLO}.

— Slide 2 —
🏠 Diseño que enamora
Cada detalle fue pensado para crear espacios que inspiran. Desde la fachada hasta los acabados interiores, la calidad se siente.

— Slide 3 —
🌳 Naturaleza en tu puerta
Áreas verdes, jardines y espacios al aire libre para que vivas en armonía con tu entorno.

— Slide 4 —
🏋️ Amenidades premium
Gimnasio equipado · Alberca · Salón de eventos · Área de juegos infantiles · Seguridad 24/7.

— Slide 5 —
📍 Ubicación privilegiada
A minutos de centros comerciales, escuelas de alto nivel y las principales vías de acceso.

— Slide 6 —
💬 ¿Ya agendaste tu visita?
Escríbenos hoy y agenda un recorrido sin compromiso. Tu familia merece el mejor hogar.`,

  blog: `# {DESARROLLO}: El desarrollo que está redefiniendo el concepto de hogar en la región

Cuando hablamos de calidad de vida, inevitablemente pensamos en el entorno donde vivimos. {DESARROLLO} nació con una premisa clara: crear espacios residenciales que vayan más allá de las cuatro paredes.

## Un proyecto con visión

Desde su concepción, {DESARROLLO} fue diseñado para responder a las necesidades reales de las familias contemporáneas. No se trata solo de metros cuadrados, sino de cómo esos metros se convierten en experiencias cotidianas que mejoran tu bienestar.

## Diseño que comunica

La arquitectura de {DESARROLLO} fusiona líneas modernas con materiales de primera. Cada fachada, cada espacio común y cada acabado interior fue elegido con criterio estético y funcional. El resultado: un desarrollo que se ve diferente porque fue pensado diferente.

## Amenidades que hacen la diferencia

Uno de los pilares de {DESARROLLO} es su propuesta de amenidades. Un gimnasio completamente equipado, alberca, áreas verdes y espacios para toda la familia conforman una oferta que pocas opciones en el mercado pueden igualar.

## Ubicación estratégica

La localización de {DESARROLLO} no es casualidad. Está diseñada para conectarte con lo que más usas: colegios, centros de salud, supermercados y vías principales. Menos tiempo en el tráfico, más tiempo para lo que importa.

## ¿Por qué {DESARROLLO} es la decisión correcta?

Invertir en una propiedad es una de las decisiones más importantes de tu vida. {DESARROLLO} representa no solo un hogar, sino un patrimonio que crecerá con tu familia. La combinación de calidad constructiva, diseño y ubicación lo convierte en una opción sólida tanto para vivir como para invertir.

Agenda tu visita hoy y compruébalo por ti mismo.`,

  email: `Asunto: Tu nuevo hogar en {DESARROLLO} te está esperando

Hola,

Sabemos que encontrar el hogar ideal no es tarea fácil. Por eso queremos presentarte {DESARROLLO}, un proyecto pensado para familias que buscan algo más que una casa: buscan un estilo de vida.

**¿Qué hace especial a {DESARROLLO}?**

• Casas y departamentos con diseño contemporáneo y acabados premium
• Amenidades completas: gimnasio, alberca, áreas verdes y seguridad 24/7
• Ubicación privilegiada con acceso rápido a los servicios que más usas
• Opciones de financiamiento flexibles adaptadas a tu situación

**Por tiempo limitado:**

Estamos ofreciendo condiciones especiales para los primeros compradores de nuestra nueva etapa. Esta es tu oportunidad de asegurar la unidad que mejor se adapte a ti y tu familia.

---

¿Tienes preguntas? Responde este correo o llámanos directamente. Nuestro equipo está listo para acompañarte en cada paso del proceso.

Agenda tu visita sin compromiso →

Con gusto,
Equipo {DESARROLLO}

---
*Para dejar de recibir comunicaciones, haz clic aquí. Aviso de privacidad disponible en nuestro sitio web.*`,

  ad: `📢 ANUNCIO — {DESARROLLO}

**Headline:** Tu hogar ideal ya existe — y está más cerca de lo que crees.

**Descripción corta:**
{DESARROLLO} | Amenidades premium · Diseño moderno · Financiamiento flexible. Agenda tu visita hoy.

---

**Variante A (conversión):**
🏡 Casas desde $X MXN · Entrega inmediata · Seguridad 24/7
👉 Agenda tu recorrido gratis → [CTA]

**Variante B (awareness):**
Hay hogares y hay {DESARROLLO}.
Descubre la diferencia que hace un espacio bien pensado.
→ Ver disponibilidad

**Variante C (retargeting):**
Aún estás pensando en {DESARROLLO}?
Quedan pocas unidades disponibles en esta etapa.
Reserva hoy con $X de enganche.

---

**Copy para meta description:**
Descubre {DESARROLLO}, el desarrollo residencial que combina diseño, ubicación y calidad de vida. Visítanos y enamórate de tu nuevo hogar.`,

  guion: `🎬 GUIÓN — Spot 30s | {DESARROLLO}

[ESCENA 1 — EXTERIOR · DÍA]
Plano aéreo del desarrollo. Luz dorada de tarde.
NARRADOR (V.O.): "Hay lugares que desde el primer momento... te dicen que sí."

[ESCENA 2 — FAMILIA · ENTRADA]
Familia llega al desarrollo. Sonríen al entrar.
NARRADOR (V.O.): "Diseñados para vivir bien. Pensados para durar."

[ESCENA 3 — AMENIDADES]
Cortes rápidos: alberca, gimnasio, área verde, juegos infantiles.
NARRADOR (V.O.): "Todo lo que necesitas, exactamente donde lo necesitas."

[ESCENA 4 — INTERIOR · SALA]
Pareja sentada, luz natural, espacio amplio.
NARRADOR (V.O.): "Bienvenido a {DESARROLLO}."

[ESCENA 5 — LOGO + CTA]
Logo del desarrollo. Tagline.
TEXTO EN PANTALLA: "Agenda tu visita hoy · [website]"
NARRADOR (V.O.): "Tu historia empieza aquí."

---

DURACIÓN: 28-32 segundos
MÚSICA: Instrumental suave, progresiva
TONO: Emotivo, aspiracional, familiar`,
};

function streamDemoText(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = text.split(/(\s+)/);
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise(r => setTimeout(r, Math.random() * 18 + 4));
      }
      controller.close();
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

export async function POST(req: NextRequest) {
  const { tipo, desarrollo: desNombre, tono, audiencia, prompt } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const template = DEMO_COPY[tipo] ?? DEMO_COPY["post"];
    const text = template.replace(/\{DESARROLLO\}/g, desNombre || "el desarrollo");
    return streamDemoText(text);
  }

  const des = DESARROLLOS.find((d) => d.nombre === desNombre) || DESARROLLOS[0];
  const contentType = CONTENT_TYPES.find((t) => t.id === tipo)?.label || "Post Instagram";

  const systemPrompt = `Eres Nexus AI, el asistente de marketing inmobiliario.
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
