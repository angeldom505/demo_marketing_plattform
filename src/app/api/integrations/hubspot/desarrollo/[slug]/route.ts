import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DESARROLLOS } from "@/lib/data/desarrollos";

const SOURCE_LABELS: Record<string, string> = {
  ORGANIC_SEARCH: "Búsqueda orgánica",
  PAID_SEARCH: "Búsqueda pagada",
  SOCIAL_MEDIA: "Redes sociales",
  EMAIL_MARKETING: "Email",
  DIRECT_TRAFFIC: "Directo",
  REFERRALS: "Referido",
  OTHER_CAMPAIGNS: "Otras campañas",
  PAID_SOCIAL: "Social pagado",
};

function getGeneracion(fecha: string | null): string {
  if (!fecha) return "Desconocida";
  const year = new Date(fecha).getFullYear();
  if (year >= 1997) return "Gen Z";
  if (year >= 1981) return "Millennial";
  if (year >= 1965) return "Gen X";
  if (year >= 1946) return "Boomer";
  return "Desconocida";
}

function getEtapaVida(marital: string | null, fecha: string | null): string {
  const edad = fecha ? new Date().getFullYear() - new Date(fecha).getFullYear() : null;
  if (!edad) return "Desconocida";
  if (edad <= 30 && (!marital || marital === "single")) return "Joven soltero";
  if (edad <= 38 && (marital === "married" || marital === "in_relationship")) return "Pareja joven";
  if (edad <= 50) return "Familia";
  return "Nido vacío";
}

function topAll(arr: string[]): { label: string; count: number }[] {
  const counts = arr.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1; return acc;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function getSearchTerm(slug: string): string | null {
  const d = DESARROLLOS.find(d => d.slug === slug);
  if (!d) return null;
  // Usar la primera palabra significativa del nombre como término de búsqueda
  const words = d.nombre.split(/\s+/).filter(w => w.length > 3);
  return words[0] ?? d.nombre;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const safeSlug = slug.replace(/[^a-z0-9-]/g, "");

  const searchTerm = getSearchTerm(safeSlug);
  if (!searchTerm) return NextResponse.json({ error: "Desarrollo no reconocido" }, { status: 404 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: rows, error } = await supabase
    .from("hubspot_contactos")
    .select("*")
    .ilike("desarrollo_interes", `%${searchTerm}%`)
    .eq("lifecyclestage", "customer");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows || rows.length === 0) return NextResponse.json({ total: 0 });

  const generaciones = rows.map(r => getGeneracion(r.fecha_de_nacimiento));
  const canales = rows.map(r => {
    const src = r.hs_analytics_source ?? r.canal_de_captacion ?? "";
    return SOURCE_LABELS[src] ?? (src || "Desconocido");
  });
  const modelos = rows.map(r => r.modelo ?? r.modelo_comercial ?? "").filter(Boolean);
  const etapas = rows.map(r => getEtapaVida(r.marital_status, r.fecha_de_nacimiento));

  const capacidades = rows
    .map(r => r.capacidad_maxima_bancaria as number | null)
    .filter((n): n is number => n !== null && n > 0);

  // Movilidad: local si la ciudad del contacto contiene la ciudad del desarrollo
  const d = DESARROLLOS.find(d => d.slug === safeSlug)!;
  const ciudadDev = d.ciudad.toLowerCase();
  let local = 0, foraneo = 0, sinCity = 0;
  for (const r of rows) {
    const city = (r.city ?? "").toLowerCase();
    if (!city) { sinCity++; continue; }
    if (city.includes(ciudadDev) || ciudadDev.includes(city)) local++;
    else foraneo++;
  }

  // Velocidad de decisión (días desde createdate hasta hoy para quienes ya son clientes)
  const now = Date.now();
  let caliente = 0, tibio = 0, frio = 0;
  for (const r of rows) {
    if (!r.createdate) continue;
    const dias = (now - new Date(r.createdate).getTime()) / 86_400_000;
    if (dias < 30) caliente++;
    else if (dias < 90) tibio++;
    else frio++;
  }

  return NextResponse.json({
    total: rows.length,
    generacion: topAll(generaciones),
    canal: topAll(canales),
    modelo: topAll(modelos),
    etapaVida: topAll(etapas),
    movilidad: { local, foraneo, sinCity },
    velocidad: { caliente, tibio, frio },
    capacidadBancaria: capacidades.length > 0 ? {
      min: Math.min(...capacidades),
      max: Math.max(...capacidades),
      promedio: Math.round(capacidades.reduce((a, b) => a + b, 0) / capacidades.length),
      conDato: capacidades.length,
    } : null,
  });
}
