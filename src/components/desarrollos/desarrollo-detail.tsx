"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeftIcon, BuildingIcon, UsersIcon, ClockIcon, FileTextIcon,
  SparklesIcon, PlusIcon, ChevronDownIcon, WandIcon, ImageIcon, CameraIcon,
  BookOpenIcon, MailIcon, MegaphoneIcon, FilmIcon, GalleryHorizontalEndIcon,
  WavesIcon, DumbbellIcon, TargetIcon, LaptopIcon, ShieldCheckIcon, FlameIcon,
  LeafIcon, CarIcon, UmbrellaIcon, SmileIcon, HeartIcon, ExternalLinkIcon,
  VideoIcon, Maximize2Icon, BedDoubleIcon, LayersIcon, DropletIcon, ActivityIcon,
  UtensilsIcon, CircleIcon, StarIcon, HomeIcon, MapPinIcon, TagIcon,
  TrendingUpIcon, ZapIcon,
} from "lucide-react";
import { REGION_COLORS, getHistorial, type HistorialItem, type Desarrollo } from "@/lib/data/desarrollos";
import { PreviewModal } from "@/components/ui/format-previews";

// ── Ficha parsers ────────────────────────────────────────────────────────────

interface ParsedModelo {
  nombre: string;
  tipo: "casa" | "departamento";
  m2: number | null;
  m2Terreno: number | null;
  habitaciones: number | null;
  banos: number | null;
  niveles: number | null;
  precioDesde: number | null;
  mensualidadDesde: number | null;
  distribucion: string[];
  acabados: string[];
  linkWeb: string | null;
  recorridoVirtual: string | null;
}

function extractNum(text: string, re: RegExp): number | null {
  const m = text.match(re);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}
function extractFloat(text: string, re: RegExp): number | null {
  const m = text.match(re);
  return m ? parseFloat(m[1]) : null;
}
function extractUrl(text: string, re: RegExp): string | null {
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
function extractM2(text: string): number | null {
  const m = text.match(/(\d+)(?:\s+a\s+\d+)?\s+metros?\s+cuadrados?\s+de\s+construcci[oó]n/i)
    || text.match(/(\d+)\s+metros?\s+cuadrados?/i);
  return m ? parseInt(m[1], 10) : null;
}
function extractPrecio(text: string): number | null {
  const m = text.match(/(?:[Pp]recios?\s+)?[Dd]esde\s+([\d,]+)\s+pesos/);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}

function parseModelos(content: string): ParsedModelo[] {
  const normalized = content.replace(/^#{1,4}\s*/gm, "");
  const re = /^(Casa|Departamento)\s+[Mm]odelo\s+([^:\n]+):/gm;
  const hits: Array<{ index: number; tipo: "casa" | "departamento"; nombre: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized)) !== null) {
    hits.push({ index: m.index, tipo: m[1].toLowerCase() === "casa" ? "casa" : "departamento", nombre: m[2].trim() });
  }
  return hits.map((h, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].index : normalized.length;
    const txt = normalized.slice(h.index, end);

    const bodyLines = txt.split("\n").map(l => l.trim()).filter(Boolean);
    let pastHeader = false;
    const distribucion: string[] = [];
    let acabados: string[] = [];
    for (const line of bodyLines) {
      if (!pastHeader && /^(Casa|Departamento)\s+[Mm]odelo/i.test(line)) { pastHeader = true; continue; }
      if (!pastHeader) continue;
      if (/^(Precio|Mensualidad|Link|Recorrido|Sitio\s+web|Agendar)/i.test(line)) break;
      if (/^[Dd]esde\s+[\d]/.test(line)) break;
      const acabM = line.match(/[Ee]quipamiento\s+y\s+acabados[:\s]+(.+)/);
      if (acabM) {
        acabados = acabM[1].split(/,\s*(?:y\s+)?/).map(s => s.replace(/\.$/, "").trim()).filter(s => s.length > 1);
      } else {
        distribucion.push(line);
      }
    }

    return {
      nombre: h.nombre,
      tipo: h.tipo,
      m2: extractM2(txt),
      m2Terreno: extractNum(txt, /(\d+)\s+metros?\s+cuadrados?\s+de\s+terreno/i),
      habitaciones: extractNum(txt, /(\d+)\s+habitaciones/),
      banos: extractFloat(txt, /([\d.]+)\s+ba[ñn]os?/),
      niveles: extractNum(txt, /(\d+)\s+niveles/),
      precioDesde: extractPrecio(txt),
      mensualidadDesde: extractNum(txt, /[Mm]ensualidades?\s+desde\s+([\d,]+)/),
      distribucion,
      acabados,
      linkWeb: extractUrl(txt, /(?:[Ss]itio\s+web|[Ll]ink\s+web)[^:\n]*:\s*(https?:\/\/\S+)/),
      recorridoVirtual: extractUrl(txt, /[Rr]ecorrido\s+[Vv]irtual[^:\n]*:\s*(https?:\/\/\S+)/),
    };
  });
}

function parseAmenidadesList(content: string): string[] {
  const sectionM = content.match(/[Aa]menidades?([\s\S]*?)(?=\n##\s|$)/);
  if (!sectionM) return [];
  let text = sectionM[1] || sectionM[0];
  text = text.replace(/https?:\/\/\S+/g, "");
  text = text.replace(/[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{0,50}:\s*/g, " ");
  const parts = text.split(/[,;]/).map(s => s.trim().replace(/\.$/,"").replace(/\n/g," ").trim());
  const items: string[] = [];
  for (const p of parts) {
    const clean = p.replace(/^(y|e|o|el|la|los|las|un|una)\s+/i,"").trim();
    if (clean.length >= 3 && clean.length <= 55 && !clean.includes(":") && !/^\d/.test(clean))
      items.push(clean.charAt(0).toUpperCase() + clean.slice(1));
  }
  return [...new Set(items)].filter(Boolean);
}

function parsePrecioDesde(content: string): number | null {
  const m = content.match(/[Pp]recios?\s*:\s*[^.]*[Dd]esde\s+([\d,]+)\s+pesos/)
    || content.match(/[Dd]esde\s+([\d,]+)\s+pesos\s+mexicanos/);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
}

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

// ── Amenidad icon map ─────────────────────────────────────────────────────────

const AMENIDAD_MAP: Array<{ kw: string[]; icon: React.ElementType; color: string }> = [
  { kw: ["semi","olímpica","canal de nado","infinity pool"], icon: WavesIcon, color: "#0EA5E9" },
  { kw: ["alberca","piscina","chapoteadero","pool","jacuzzi"], icon: WavesIcon, color: "#0EA5E9" },
  { kw: ["tenis","tennis"], icon: TargetIcon, color: "#F3611F" },
  { kw: ["pádel","paddle"], icon: TargetIcon, color: "#F3611F" },
  { kw: ["fútbol","futbol","soccer","campo de fut"], icon: CircleIcon, color: "#10B981" },
  { kw: ["basket","baloncesto"], icon: CircleIcon, color: "#F59E0B" },
  { kw: ["volleyball","handball"], icon: CircleIcon, color: "#8B5CF6" },
  { kw: ["gym","fitness","acondicionamiento","multi-fitness","fitness start"], icon: DumbbellIcon, color: "#8B5CF6" },
  { kw: ["yoga"], icon: ActivityIcon, color: "#EC4899" },
  { kw: ["masajes","massage","spa","sauna","vapor"], icon: SparklesIcon, color: "#EC4899" },
  { kw: ["coworking","co-working","networking"], icon: LaptopIcon, color: "#0EA5E9" },
  { kw: ["pet park","pet garden","mascotas"], icon: HeartIcon, color: "#F59E0B" },
  { kw: ["juegos infantiles","play zone","baby park","junior","ludoteca","kids","dunas"], icon: SmileIcon, color: "#F59E0B" },
  { kw: ["jogging","patinaje","patines","parkour","triciclos","bicicleta","ciclop"], icon: ActivityIcon, color: "#10B981" },
  { kw: ["kayak","muelle","lago","cable park"], icon: WavesIcon, color: "#0EA5E9" },
  { kw: ["restaurante","bar","cafetería","cafeteria","picnic"], icon: UtensilsIcon, color: "#F59E0B" },
  { kw: ["anfiteatro","salón de eventos","social lounge","social room","sala lounge","eventos"], icon: UsersIcon, color: "#8B5CF6" },
  { kw: ["salón","sala","lounge","club","private room","casa club"], icon: HomeIcon, color: "#8B5CF6" },
  { kw: ["asoleadero"], icon: StarIcon, color: "#F59E0B" },
  { kw: ["acceso controlado","vigilancia","guarda","seguridad"], icon: ShieldCheckIcon, color: "#10B981" },
  { kw: ["asadores","bbq","parrilla"], icon: FlameIcon, color: "#F3611F" },
  { kw: ["palapa","pérgola","pergola"], icon: UmbrellaIcon, color: "#F59E0B" },
  { kw: ["áreas verdes","jardín","espina verde","parque","senderos","macro parque"], icon: LeafIcon, color: "#10B981" },
  { kw: ["estacionamiento","cajón"], icon: CarIcon, color: "#6B7280" },
];

function amenidadIcon(nombre: string): { icon: React.ElementType; color: string } {
  const lower = nombre.toLowerCase();
  for (const { kw, icon, color } of AMENIDAD_MAP) {
    if (kw.some(k => lower.includes(k))) return { icon, color };
  }
  return { icon: StarIcon, color: "#6B7280" };
}

// ── Ficha UI subcomponents ───────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(243,97,31,0.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={15} color="#F3611F" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: "white", fontWeight: 600, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function SectionLabel({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <h3 style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</h3>
      {count != null && (
        <span style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 10, background: "rgba(243,97,31,0.12)", color: "#F3611F", fontWeight: 700 }}>{count}</span>
      )}
    </div>
  );
}

const LEVEL_LABELS: Record<string, string> = {
  "planta baja": "PB",
  "primer nivel": "N1",
  "segundo nivel": "N2",
  "tercer nivel": "N3",
  "cuarto nivel": "N4",
};

function ModelCard({ m }: { m: ParsedModelo }) {
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 2, background: "linear-gradient(90deg, #F3611F, transparent)" }} />
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: m.tipo === "casa" ? "#10B981" : "#0EA5E9",
            background: m.tipo === "casa" ? "rgba(16,185,129,0.1)" : "rgba(14,165,233,0.1)",
            padding: "3px 9px", borderRadius: 5,
          }}>{m.tipo}</span>
        </div>

        <h3 style={{ margin: 0, color: "white", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{m.nombre}</h3>

        {/* Price */}
        {m.precioDesde && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>desde</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#F3611F", letterSpacing: "-0.02em", lineHeight: 1 }}>{fmt(m.precioDesde)}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 5 }}>
              MXN{m.mensualidadDesde ? ` · ${fmt(m.mensualidadDesde)}/mes` : ""}
            </div>
          </div>
        )}

        {/* Specs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {m.m2 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}>
              <Maximize2Icon size={11} color="rgba(255,255,255,0.4)" />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 500 }}>{m.m2} m² constr.</span>
            </div>
          )}
          {m.m2Terreno && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}>
              <MapPinIcon size={11} color="rgba(255,255,255,0.4)" />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 500 }}>{m.m2Terreno} m² terreno</span>
            </div>
          )}
          {m.habitaciones && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}>
              <BedDoubleIcon size={11} color="rgba(255,255,255,0.4)" />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 500 }}>{m.habitaciones} habitaciones</span>
            </div>
          )}
          {m.banos && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}>
              <DropletIcon size={11} color="rgba(255,255,255,0.4)" />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 500 }}>{m.banos} baños</span>
            </div>
          )}
          {m.niveles && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 6, background: "rgba(255,255,255,0.05)" }}>
              <LayersIcon size={11} color="rgba(255,255,255,0.4)" />
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11.5, fontWeight: 500 }}>{m.niveles} niveles</span>
            </div>
          )}
        </div>

        {/* Distribución */}
        {m.distribucion.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 2 }}>Distribución</div>
            {m.distribucion.map((line, i) => {
              const lvlM = line.match(/^(Planta\s+baja|Primer\s+nivel|Segundo\s+nivel|Tercer\s+nivel|Cuarto\s+nivel)\s+con\s+(.+)/i);
              if (lvlM) {
                const label = LEVEL_LABELS[lvlM[1].toLowerCase()] ?? lvlM[1].substring(0, 2).toUpperCase();
                return (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#F3611F", background: "rgba(243,97,31,0.12)", padding: "2px 6px", borderRadius: 4, flexShrink: 0, letterSpacing: "0.05em", marginTop: 2 }}>{label}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{lvlM[2]}</span>
                  </div>
                );
              }
              return <p key={i} style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>{line}</p>;
            })}
          </div>
        )}

        {/* Acabados */}
        {m.acabados.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700 }}>Acabados</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {m.acabados.map((a, i) => (
                <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 9px", borderRadius: 5 }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* CTAs */}
        {(m.recorridoVirtual || m.linkWeb) && (
          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            {m.recorridoVirtual && (
              <a href={m.recorridoVirtual} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, height: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(243,97,31,0.12)", border: "1px solid rgba(243,97,31,0.3)", borderRadius: 8, color: "#F3611F", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                <VideoIcon size={12} />Tour virtual
              </a>
            )}
            {m.linkWeb && (
              <a href={m.linkWeb} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, height: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                <ExternalLinkIcon size={12} />Ver sitio
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AmenidadChip({ nombre }: { nombre: string }) {
  const { icon: Icon, color } = amenidadIcon(nombre);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}18`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={14} color={color} />
      </div>
      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12.5, fontWeight: 500, lineHeight: 1.3 }}>{nombre}</span>
    </div>
  );
}

function FichaTab({ d }: { d: Desarrollo }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(d.ficha);

  useEffect(() => {
    if (!d.ficha) { setLoading(false); return; }
    fetch(`/api/content/${d.slug}/ficha`)
      .then(r => r.json())
      .then(data => setContent(data.content ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [d.slug, d.ficha]);

  const modelos = content ? parseModelos(content) : [];
  const amenidades = content ? parseAmenidadesList(content) : [];
  const precios = modelos.filter(m => m.precioDesde !== null).map(m => m.precioDesde!);
  const precioDesde = precios.length > 0 ? Math.min(...precios) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        <StatChip icon={MapPinIcon} label="Región" value={d.region} />
        <StatChip icon={BuildingIcon} label="Ciudad" value={d.ciudad} />
        <StatChip icon={HomeIcon} label="Tipología" value={d.tipologia} />
        {precioDesde ? <StatChip icon={TagIcon} label="Precio desde" value={fmt(precioDesde)} /> : null}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[80, 60, 70, 50].map((w, i) => (
            <div key={i} style={{ height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)", width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Modelos */}
      {!loading && modelos.length > 0 && (
        <section>
          <SectionLabel title="Modelos disponibles" count={modelos.length} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {modelos.map(m => <ModelCard key={m.nombre} m={m} />)}
          </div>
        </section>
      )}

      {/* Amenidades */}
      {!loading && amenidades.length > 0 && (
        <section>
          <SectionLabel title="Amenidades" count={amenidades.length} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
            {amenidades.map(a => <AmenidadChip key={a} nombre={a} />)}
          </div>
        </section>
      )}

      {/* No data state */}
      {!loading && !d.ficha && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 9, background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <FileTextIcon size={14} color="#0EA5E9" />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5 }}>
            Documentación pendiente de sincronización desde Google Drive.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Markdown renderer ────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "white", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, fontSize: "0.9em", color: "#0EA5E9" }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function parseMarkdown(raw: string): React.ReactNode[] {
  const lines = raw.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0; let key = 0;

  if (lines[0]?.trim() === "---") {
    i = 1;
    while (i < lines.length && lines[i]?.trim() !== "---") i++;
    i++;
  }

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.trim() === "---") {
      elements.push(<hr key={key++} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "20px 0" }} />);
      i++; continue;
    }
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      elements.push(<h2 key={key++} style={{ color: "white", fontSize: 18, fontWeight: 700, margin: "28px 0 10px", letterSpacing: "-0.02em" }}>{renderInline(line.slice(2))}</h2>);
      i++; continue;
    }
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      elements.push(<h3 key={key++} style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "28px 0 10px", paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{renderInline(line.slice(3))}</h3>);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      elements.push(<h4 key={key++} style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, margin: "20px 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{renderInline(line.slice(4))}</h4>);
      i++; continue;
    }
    if (line.startsWith("> ")) {
      const qLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { qLines.push(lines[i].slice(2)); i++; }
      elements.push(
        <div key={key++} style={{ background: "rgba(243,97,31,0.06)", border: "1px solid rgba(243,97,31,0.2)", borderLeft: "3px solid #F3611F", borderRadius: "0 8px 8px 0", padding: "12px 16px", margin: "12px 0" }}>
          {qLines.map((l, qi) => <p key={qi} style={{ margin: qi === 0 ? 0 : "4px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.6 }}>{renderInline(l)}</p>)}
        </div>
      );
      continue;
    }
    if (line.startsWith("|")) {
      const tLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) { tLines.push(lines[i]); i++; }
      const rows = tLines.filter(l => !l.match(/^\|[\s|:=-]+\|$/));
      elements.push(
        <div key={key++} style={{ overflowX: "auto", margin: "12px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").slice(1, -1).map(c => c.trim());
                const isHead = ri === 0;
                return (
                  <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: isHead ? "rgba(255,255,255,0.03)" : "transparent" }}>
                    {cells.map((cell, ci) => {
                      const Tag = isHead ? "th" : "td";
                      return <Tag key={ci} style={{ padding: "8px 12px", textAlign: "left", color: isHead ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.85)", fontWeight: isHead ? 600 : 400, fontSize: isHead ? 10.5 : 12.5, textTransform: isHead ? "uppercase" as const : "none" as const, letterSpacing: isHead ? "0.07em" : "normal", verticalAlign: "top" }}>{renderInline(cell)}</Tag>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (line.match(/^[\s]*[-*+] /) || line.match(/^[\s]*\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].match(/^[\s]*[-*+] /) || lines[i].match(/^[\s]*\d+\. /))) {
        items.push(lines[i].replace(/^[\s]*[-*+] /, "").replace(/^[\s]*\d+\. /, "").replace(/^\[[ x]\] /, ""));
        i++;
      }
      elements.push(
        <ul key={key++} style={{ margin: "8px 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
          {items.map((item, ii) => <li key={ii} style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.55 }}>{renderInline(item)}</li>)}
        </ul>
      );
      continue;
    }
    const pLines: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].startsWith(">") && !lines[i].startsWith("|") && !lines[i].match(/^[\s]*[-*+] /) && lines[i].trim() !== "---") {
      pLines.push(lines[i]); i++;
    }
    if (pLines.length > 0) {
      elements.push(<p key={key++} style={{ margin: "8px 0", color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7 }}>{renderInline(pLines.join(" "))}</p>);
    } else { i++; }
  }
  return elements;
}

function MarkdownView({ slug, doc }: { slug: string; doc: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetch(`/api/content/${slug}/${doc}`)
      .then(r => r.json())
      .then(data => { if (data.content) setContent(data.content); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug, doc]);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 0" }}>
      {[80, 55, 70, 40, 65].map((w, i) => <div key={i} style={{ height: 12, borderRadius: 4, background: "rgba(255,255,255,0.05)", width: `${w}%` }} />)}
    </div>
  );
  if (error || !content) return <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Archivo no disponible para este desarrollo.</div>;
  return <div style={{ lineHeight: 1.6 }}>{parseMarkdown(content)}</div>;
}

// ── Tabs ────────────────────────────────────────────────────────────────────

function Tab({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number | null }) {
  return (
    <button onClick={onClick} style={{ position: "relative", padding: "12px 4px", background: "none", border: "none", color: active ? "white" : "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
      {label}
      {count != null && <span style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 10, background: active ? "rgba(243,97,31,0.18)" : "rgba(255,255,255,0.06)", color: active ? "#F3611F" : "rgba(255,255,255,0.45)", fontWeight: 600 }}>{count}</span>}
      {active && <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "#F3611F", borderRadius: 1, boxShadow: "0 0 8px rgba(243,97,31,0.7)" }} />}
    </button>
  );
}

function EmptyTabContent({ icon: Icon, title, blurb }: { icon: React.ElementType; title: string; blurb: string }) {
  return (
    <div style={{ padding: "48px 24px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(243,97,31,0.1)", color: "#F3611F", display: "grid", placeItems: "center" }}><Icon size={20} /></div>
      <div>
        <div style={{ color: "white", fontSize: 15, fontWeight: 600 }}>{title}</div>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 13, maxWidth: 380 }}>{blurb}</p>
      </div>
      <button style={{ height: 34, padding: "0 14px", background: "rgba(243,97,31,0.12)", border: "1px solid rgba(243,97,31,0.35)", color: "#F3611F", borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }} className="iconBtn">
        <PlusIcon size={13} />Cargar documentación
      </button>
    </div>
  );
}

function ContentTypeBtn({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ flex: "1 1 calc(33% - 6px)", minWidth: 0, padding: "12px 10px", background: active ? "rgba(243,97,31,0.12)" : "rgba(255,255,255,0.03)", border: active ? "1px solid rgba(243,97,31,0.45)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: active ? "#F3611F" : "rgba(255,255,255,0.7)", fontSize: 11.5, fontWeight: 500, fontFamily: "inherit", transition: "all 150ms" }}>
      <Icon size={17} />{label}
    </button>
  );
}

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  Instagram: CameraIcon, Carousel: GalleryHorizontalEndIcon, Mail: MailIcon,
  Megaphone: MegaphoneIcon, Film: FilmIcon, BookOpen: BookOpenIcon,
};

function LocalHistorialRow({ item, onPreview }: { item: HistorialItem; onPreview: () => void }) {
  const CIcon = CHANNEL_ICONS[item.channel] || FileTextIcon;
  const snippet = item.output.slice(0, 120).replace(/\n/g, " ");
  const date = new Date(item.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto", gap: 14, alignItems: "center", padding: "14px 16px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }} className="histRow">
      <div style={{ width: 32, height: 32, borderRadius: 7, background: "rgba(243,97,31,0.1)", color: "#F3611F", display: "grid", placeItems: "center" }}><CIcon size={15} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "white", fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{item.tipoLabel}</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snippet}</div>
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{date}</span>
      <button onClick={onPreview} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }} className="iconBtn">Ver →</button>
    </div>
  );
}

// ── HubSpot synthesis ────────────────────────────────────────────────────────

interface HSSynthesis {
  total: number;
  generacion: { label: string; count: number }[];
  canal: { label: string; count: number }[];
  modelo: { label: string; count: number }[];
  capacidadBancaria: { min: number; max: number; promedio: number } | null;
}

function fmtMXN(n: number) {
  return "$" + (n >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    : n.toLocaleString("en-US"));
}

function HubSpotSynthesis({ slug }: { slug: string }) {
  const [data, setData] = useState<HSSynthesis | null>(null);

  useEffect(() => {
    fetch(`/api/integrations/hubspot/desarrollo/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.total != null) setData(d); })
      .catch(() => {});
  }, [slug]);

  if (!data || data.total === 0) return null;

  const topGen = data.generacion[0];
  const topCanal = data.canal[0];
  const topModelo = data.modelo[0];

  const chips = [
    { icon: UsersIcon, label: "Clientes", value: String(data.total), color: "#F3611F" },
    topGen && { icon: TrendingUpIcon, label: "Generación", value: `${topGen.label} (${Math.round(topGen.count / data.total * 100)}%)`, color: "#8B5CF6" },
    topCanal && { icon: ZapIcon, label: "Canal principal", value: topCanal.label, color: "#0EA5E9" },
    topModelo && { icon: HomeIcon, label: "Modelo top", value: topModelo.label, color: "#10B981" },
    data.capacidadBancaria && { icon: TagIcon, label: "Cap. bancaria prom.", value: fmtMXN(data.capacidadBancaria.promedio), color: "#F59E0B" },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; color: string }[];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#F3611F", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4, flexShrink: 0 }}>CRM</span>
      {chips.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon size={12} color={c.color} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginRight: 3 }}>{c.label}</span>
            <span style={{ fontSize: 12, color: "white", fontWeight: 600 }}>{c.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface DesarrolloDetailProps {
  d: Desarrollo;
  onNavigate: (view: string, slug?: string) => void;
  onGenerate: (d: Desarrollo, type: string) => void;
}

export function DesarrolloDetail({ d, onNavigate, onGenerate }: DesarrolloDetailProps) {
  const [tab, setTab] = useState("ficha");
  const [contentType, setContentType] = useState("post");
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const regionColor = REGION_COLORS[d.region];

  useEffect(() => {
    const all = getHistorial();
    setHistorial(all.filter(item => item.desarrollo === d.nombre).slice(0, 10));
  }, [d.nombre]);

  return (
    <div style={{ padding: "28px 36px 56px", maxWidth: 1500, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      <button onClick={() => onNavigate("desarrollos")} style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px 4px 4px", borderRadius: 6, fontFamily: "inherit" }} className="iconBtn">
        <ChevronLeftIcon size={14} />Todos los desarrollos
      </button>

      <section style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 14, background: `${regionColor}1A`, border: `1px solid ${regionColor}40`, color: regionColor, alignSelf: "flex-start", fontSize: 11.5, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: regionColor, boxShadow: `0 0 8px ${regionColor}` }} />
            {d.region} · {d.ciudad}
          </div>
          {d.logo ? (
            <div style={{
              height: 100,
              padding: "10px 24px",
              background: "rgba(255,255,255,0.97)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 20px rgba(0,0,0,0.2)",
              alignSelf: "flex-start",
              minWidth: 200,
            }}>
              <Image
                src={d.logo}
                alt={d.nombre}
                width={280}
                height={80}
                style={{ objectFit: "contain", maxHeight: 80, width: "auto", maxWidth: 280 }}
                priority
              />
            </div>
          ) : (
            <h1 style={{ margin: 0, color: "white", fontSize: 48, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1 }}>{d.nombre}</h1>
          )}
          <div style={{ display: "flex", gap: 24, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><BuildingIcon size={13} />{d.tipologia}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><UsersIcon size={13} />{d.unidades} unidades</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><ClockIcon size={13} />Entrega pendiente</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ height: 38, padding: "0 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }} className="iconBtn">
            <FileTextIcon size={14} />Exportar ficha
          </button>
          <button style={{ height: 38, padding: "0 14px", background: "transparent", border: "1px solid rgba(243,97,31,0.4)", color: "#F3611F", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }} className="iconBtn">
            Editar documentación
          </button>
        </div>
      </section>

      <HubSpotSynthesis slug={d.slug} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "flex-start" }}>
        <div className="glass" style={{ borderRadius: 12, padding: "4px 24px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 22, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 22, overflowX: "auto" }}>
            <Tab label="Ficha técnica" active={tab === "ficha"} onClick={() => setTab("ficha")} />
            <Tab label="Storytelling" active={tab === "storytelling"} onClick={() => setTab("storytelling")} count={d.storytelling ? 1 : null} />
            <Tab label="Competencia" active={tab === "competencia"} onClick={() => setTab("competencia")} count={d.competencia ? 1 : null} />
            <Tab label="Audiencias" active={tab === "audiencias"} onClick={() => setTab("audiencias")} count={d.audiencias ? 1 : null} />
          </div>
          <div style={{ minHeight: 360 }}>
            {tab === "ficha" && <FichaTab d={d} />}
            {tab === "storytelling" && (d.storytelling ? <MarkdownView slug={d.slug} doc="storytelling" /> : <EmptyTabContent icon={BookOpenIcon} title="Sin storytelling cargado" blurb="Sube la narrativa base del desarrollo para que la IA genere contenido alineado." />)}
            {tab === "competencia" && (d.competencia ? <MarkdownView slug={d.slug} doc="competencia" /> : <EmptyTabContent icon={MegaphoneIcon} title="Sin análisis de competencia" blurb="Carga las fichas de los desarrollos vecinos para identificar diferenciadores reales." />)}
            {tab === "audiencias" && (d.audiencias ? <MarkdownView slug={d.slug} doc="audiencias" /> : <EmptyTabContent icon={UsersIcon} title="Sin audiencias definidas" blurb="Importa segmentos del CRM o crea audiencias custom para personalizar el copy." />)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 88 }}>
          <div className="glass" style={{ borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16, background: "linear-gradient(180deg, rgba(243,97,31,0.06), rgba(255,255,255,0.03))", border: "1px solid rgba(243,97,31,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #F3611F, #E05A1A)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 4px 14px rgba(243,97,31,0.4)" }}><WandIcon size={15} /></div>
              <div>
                <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Generar con IA</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11.5 }}>HU GPT · vinculado a {d.nombre}</div>
              </div>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Tipo de contenido</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <ContentTypeBtn icon={CameraIcon} label="Post IG" active={contentType === "post"} onClick={() => setContentType("post")} />
                <ContentTypeBtn icon={GalleryHorizontalEndIcon} label="Carrusel" active={contentType === "carrusel"} onClick={() => setContentType("carrusel")} />
                <ContentTypeBtn icon={BookOpenIcon} label="Blog" active={contentType === "blog"} onClick={() => setContentType("blog")} />
                <ContentTypeBtn icon={MailIcon} label="Email" active={contentType === "email"} onClick={() => setContentType("email")} />
                <ContentTypeBtn icon={MegaphoneIcon} label="Ad Copy" active={contentType === "ad"} onClick={() => setContentType("ad")} />
                <ContentTypeBtn icon={FilmIcon} label="Script Video" active={contentType === "video"} onClick={() => setContentType("video")} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Audiencia</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>opcional</span>
              </div>
              <button style={{ width: "100%", height: 36, padding: "0 12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, cursor: "pointer", color: "white", fontSize: 12.5, textAlign: "left", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                <span style={{ flex: 1 }}>Selecciona audiencia…</span><ChevronDownIcon size={13} />
              </button>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Prompt adicional</div>
              <textarea placeholder="Ej: enfoque en plusvalía, tono cercano, mencionar lanzamiento de fase 2…" style={{ width: "100%", minHeight: 76, resize: "vertical", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, padding: "10px 12px", color: "white", fontSize: 12.5, lineHeight: 1.45, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => onGenerate(d, contentType)} className="primaryBtn" style={{ height: 44, background: "linear-gradient(135deg, #F3611F, #E05A1A)", border: "none", borderRadius: 9, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 24px rgba(243,97,31,0.35), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
              <SparklesIcon size={16} />Generar contenido
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.45)", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span>Claude Haiku</span><span>Streaming · sin límite</span>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <ImageIcon size={14} style={{ color: "rgba(255,255,255,0.75)" }} />
              <span style={{ color: "white", fontSize: 13, fontWeight: 600, flex: 1 }}>Assets visuales</span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>pendiente</span>
            </div>
            <div style={{ padding: "20px 12px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 8, textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Fotos desde Drive en Fase 2</div>
            </div>
          </div>
        </div>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Historial de contenido</h2>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
            {historial.length > 0 ? `${historial.length} piezas generadas para ${d.nombre}` : `Sin piezas generadas para ${d.nombre} todavía`}
          </span>
        </div>
        {historial.length === 0 ? (
          <div style={{ padding: "40px 24px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(243,97,31,0.08)", color: "#F3611F", display: "grid", placeItems: "center" }}><SparklesIcon size={18} /></div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600 }}>Sin historial</div>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Genera tu primera pieza con el panel de IA para que aparezca aquí.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historial.map(item => <LocalHistorialRow key={item.id} item={item} onPreview={() => setPreviewType(item.channel)} />)}
          </div>
        )}
      </section>

      <PreviewModal open={!!previewType} onClose={() => setPreviewType(null)} type={previewType} d={d} />
    </div>
  );
}
