"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, { useState } from "react";
import Image from "next/image";
import {
  FilmIcon, SparklesIcon, ClockIcon, CheckCircleIcon,
  PlayIcon, DownloadIcon, ZapIcon, MonitorIcon,
  SmartphoneIcon, SquareIcon, MicIcon, ImageIcon,
} from "lucide-react";
import { T } from "@/styles/tokens";
import { DESARROLLOS } from "@/lib/data/desarrollos";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Demo data ──────────────────────────────────────────────────────────────────

const MODELS = [
  {
    id: "kling",
    nombre: "Kling",
    tag: "Cinematográfico",
    desc: "Realismo fotográfico, movimientos de cámara fluidos, ideal para teasers premium.",
    color: T.orange,
    badge: "Recomendado",
    specs: ["Hasta 2 min", "4K", "30fps / 60fps", "Motion tracking"],
  },
  {
    id: "seedance",
    nombre: "Seedance",
    tag: "Motion dramático",
    desc: "Transiciones dinámicas, efectos visuales intensos, óptimo para redes sociales.",
    color: T.purple,
    badge: "Redes sociales",
    specs: ["Hasta 60s", "1080p", "Variable fps", "Efectos VFX"],
  },
  {
    id: "runway",
    nombre: "Runway Gen-3",
    tag: "Edición & composición",
    desc: "Control de escena avanzado, inpainting, ideal para retoques y composición.",
    color: T.blue,
    badge: "Próximamente",
    specs: ["Hasta 30s", "1080p", "24fps", "Inpainting"],
    disabled: true,
  },
];

const FORMATS = [
  { id: "vertical", label: "9:16 Vertical", sub: "Reels · TikTok · Stories", icon: SmartphoneIcon },
  { id: "horizontal", label: "16:9 Horizontal", sub: "YouTube · Web · Presentaciones", icon: MonitorIcon },
  { id: "square", label: "1:1 Cuadrado", sub: "Feed Instagram · Facebook", icon: SquareIcon },
];

const DURATIONS = ["5s", "10s", "15s", "30s", "60s"];

const VIDEO_TYPES = [
  { id: "teaser", label: "Teaser de desarrollo", desc: "Intro aspiracional, 5-15s, máximo impacto" },
  { id: "recorrido", label: "Recorrido virtual", desc: "Tour por amenidades y espacios, 30-60s" },
  { id: "lifestyle", label: "Lifestyle", desc: "Experiencia de vida en el desarrollo, emocional" },
  { id: "amenidades", label: "Amenidades", desc: "Showcase de alberca, gimnasio, áreas comunes" },
  { id: "ubicacion", label: "Ubicación", desc: "Contexto geográfico, accesibilidad, entorno" },
  { id: "oferta", label: "Oferta comercial", desc: "Precio, preventa, CTA directo a asesor" },
];

const HISTORY: {
  id: number;
  titulo: string;
  desarrollo: string;
  modelo: string;
  formato: string;
  duracion: string;
  tipo: string;
  estado: "completado" | "procesando" | "borrador";
  fecha: string;
  thumbnail: string;
  logo?: string;
}[] = [
  {
    id: 1,
    titulo: "Aukena — Teaser atardecer terraza",
    desarrollo: "Aukena",
    modelo: "Kling",
    formato: "9:16",
    duracion: "15s",
    tipo: "Teaser",
    estado: "completado",
    fecha: "2026-05-20",
    thumbnail: T.orange,
    logo: "/logos/aukena.png",
  },
  {
    id: 2,
    titulo: "Aukena — Recorrido alberca infinity",
    desarrollo: "Aukena",
    modelo: "Kling",
    formato: "16:9",
    duracion: "30s",
    tipo: "Recorrido",
    estado: "completado",
    fecha: "2026-05-18",
    thumbnail: T.orange,
    logo: "/logos/aukena.png",
  },
  {
    id: 3,
    titulo: "Turquesa — Lifestyle familias",
    desarrollo: "Turquesa",
    modelo: "Seedance",
    formato: "9:16",
    duracion: "15s",
    tipo: "Lifestyle",
    estado: "procesando",
    fecha: "2026-05-22",
    thumbnail: T.blue,
    logo: "/logos/turquesa.png",
  },
  {
    id: 4,
    titulo: "Meriden — Teaser lanzamiento digital",
    desarrollo: "Meriden",
    modelo: "Kling",
    formato: "1:1",
    duracion: "10s",
    tipo: "Teaser",
    estado: "completado",
    fecha: "2026-05-15",
    thumbnail: T.purple,
    logo: "/logos/meriden.png",
  },
  {
    id: 5,
    titulo: "Bonza — Amenidades y jardines",
    desarrollo: "Bonza",
    modelo: "Seedance",
    formato: "16:9",
    duracion: "30s",
    tipo: "Amenidades",
    estado: "borrador",
    fecha: "2026-05-21",
    thumbnail: T.teal,
  },
  {
    id: 6,
    titulo: "Central Park — Oferta preventa Q2",
    desarrollo: "Central Park",
    modelo: "Seedance",
    formato: "9:16",
    duracion: "15s",
    tipo: "Oferta comercial",
    estado: "completado",
    fecha: "2026-05-12",
    thumbnail: T.amber,
    logo: "/logos/central-park.png",
  },
];

const STATUS_CONFIG = {
  completado:  { color: T.teal,   label: "Completado",  icon: CheckCircleIcon },
  procesando:  { color: T.orange, label: "Procesando…", icon: ClockIcon },
  borrador:    { color: T.textMuted, label: "Borrador",  icon: FilmIcon },
};

// ── Components ─────────────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.bgPanel, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusLg, fontFamily: SANS, ...style }}>
      {children}
    </div>
  );
}

function ProcessingBar() {
  return (
    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden", marginTop: 8 }}>
      <div style={{
        height: "100%", width: "60%", borderRadius: 1,
        background: `linear-gradient(90deg, ${T.orange}, #FF8A4D)`,
        animation: "shimmer 1.6s ease-in-out infinite",
        backgroundSize: "200% 100%",
      }} />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function VideoPage() {
  const [model,    setModel]    = useState("kling");
  const [format,   setFormat]   = useState("vertical");
  const [duration, setDuration] = useState("15s");
  const [videoType, setVideoType] = useState("teaser");
  const [desarrollo, setDesarrollo] = useState("aukena");
  const [prompt,   setPrompt]   = useState("");
  const [voice,    setVoice]    = useState(false);
  const [tab,      setTab]      = useState<"generar" | "historial">("generar");

  const completados = HISTORY.filter(h => h.estado === "completado").length;
  const procesando  = HISTORY.filter(h => h.estado === "procesando").length;

  const selectedDes = DESARROLLOS.find(d => d.slug === desarrollo);

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: SANS }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, color: T.textPrimary, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Video</h1>
          <p style={{ margin: "4px 0 0", color: T.textSecondary, fontSize: 13 }}>
            Kling · Seedance · fal.ai — generación cinematográfica desde fotos reales
          </p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Videos completados", val: completados, color: T.teal },
            { label: "En proceso", val: procesando, color: T.orange },
            { label: "Modelos disponibles", val: 2, color: T.purple },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontFamily: MONO, color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: `0.5px solid ${T.borderFaint}` }}>
        {([["generar", "Generar video"], ["historial", "Historial"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ height: 36, padding: "0 16px", background: "transparent", border: "none", borderBottom: tab === id ? `2px solid ${T.orange}` : "2px solid transparent", color: tab === id ? T.textPrimary : T.textMuted, fontSize: 12, fontWeight: tab === id ? 600 : 400, cursor: "pointer", fontFamily: SANS, marginBottom: -1, transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Generar ── */}
      {tab === "generar" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* Left — form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Model selector */}
            <Panel style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Modelo de IA</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => !m.disabled && setModel(m.id)}
                    disabled={m.disabled}
                    style={{
                      padding: "14px 14px",
                      background: model === m.id ? `${m.color}12` : "transparent",
                      border: `0.5px solid ${model === m.id ? m.color : T.borderDefault}`,
                      borderRadius: T.radiusMd,
                      cursor: m.disabled ? "not-allowed" : "pointer",
                      textAlign: "left",
                      opacity: m.disabled ? 0.4 : 1,
                      transition: "all 0.15s",
                      fontFamily: SANS,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: model === m.id ? m.color : T.textPrimary, fontWeight: 700 }}>{m.nombre}</span>
                      <span style={{ fontSize: 9, padding: "2px 7px", background: `${m.color}20`, borderRadius: 20, color: m.color, fontWeight: 600, border: `0.5px solid ${m.color}40` }}>{m.badge}</span>
                    </div>
                    <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{m.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {m.specs.map(s => (
                        <span key={s} style={{ fontSize: 9, color: T.textGhost, fontFamily: MONO, padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>{s}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            {/* Desarrollo */}
            <Panel style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Desarrollo</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {selectedDes?.logo && (
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    <Image src={selectedDes.logo} alt={selectedDes.nombre} width={44} height={44} style={{ objectFit: "contain" }} />
                  </div>
                )}
                <select
                  value={desarrollo}
                  onChange={e => setDesarrollo(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: T.bgSubtle,
                    border: `0.5px solid ${T.borderDefault}`,
                    borderRadius: T.radiusMd,
                    color: T.textPrimary,
                    fontSize: 13,
                    fontFamily: SANS,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {DESARROLLOS.map(d => (
                    <option key={d.slug} value={d.slug} style={{ background: T.bgPanel }}>
                      {d.nombre} — {d.ciudad}
                    </option>
                  ))}
                </select>
              </div>
              {selectedDes && (
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { l: "Región", v: selectedDes.region },
                    { l: "Tipología", v: selectedDes.tipologia },
                    { l: "Unidades", v: String(selectedDes.unidades) },
                  ].map(i => (
                    <div key={i.l} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{i.l}</div>
                      <div style={{ fontSize: 11, fontFamily: MONO, color: T.textMuted }}>{i.v}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Type + Format + Duration */}
            <Panel style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Tipo de contenido</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                {VIDEO_TYPES.map(vt => (
                  <button key={vt.id} onClick={() => setVideoType(vt.id)} style={{ padding: "10px 12px", background: videoType === vt.id ? `${T.orange}12` : "transparent", border: `0.5px solid ${videoType === vt.id ? T.orange : T.borderDefault}`, borderRadius: T.radiusMd, cursor: "pointer", textAlign: "left", fontFamily: SANS, transition: "all 0.15s" }}>
                    <div style={{ fontSize: 12, color: videoType === vt.id ? T.orange : T.textPrimary, fontWeight: 600, marginBottom: 4 }}>{vt.label}</div>
                    <div style={{ fontSize: 10, color: T.textGhost, lineHeight: 1.4 }}>{vt.desc}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Format */}
                <div>
                  <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Formato</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {FORMATS.map(f => {
                      const Icon = f.icon;
                      return (
                        <button key={f.id} onClick={() => setFormat(f.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: format === f.id ? `${T.teal}10` : "transparent", border: `0.5px solid ${format === f.id ? T.teal : T.borderDefault}`, borderRadius: 8, cursor: "pointer", fontFamily: SANS, transition: "all 0.15s" }}>
                          <Icon size={14} color={format === f.id ? T.teal : T.textGhost} />
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 12, color: format === f.id ? T.teal : T.textPrimary, fontWeight: 500 }}>{f.label}</div>
                            <div style={{ fontSize: 10, color: T.textGhost }}>{f.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Duration */}
                <div>
                  <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Duración</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {DURATIONS.map(d => (
                      <button key={d} onClick={() => setDuration(d)} style={{ padding: "10px 12px", background: duration === d ? `${T.orange}12` : "transparent", border: `0.5px solid ${duration === d ? T.orange : T.borderDefault}`, borderRadius: 8, color: duration === d ? T.orange : T.textMuted, fontSize: 13, fontFamily: MONO, fontWeight: 600, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            {/* Prompt */}
            <Panel style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Descripción del video</div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={`Ej. "Toma aérea descendiendo sobre la terraza del penthouse al atardecer, alberca infinita con vista al mar, luz cálida dorada, estilo cinematográfico premium"`}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: T.bgSubtle,
                  border: `0.5px solid ${T.borderDefault}`,
                  borderRadius: T.radiusMd,
                  color: T.textPrimary,
                  fontSize: 13,
                  fontFamily: SANS,
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => setVoice(!voice)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: voice ? `${T.purple}15` : "transparent", border: `0.5px solid ${voice ? T.purple : T.borderDefault}`, borderRadius: 20, cursor: "pointer", fontFamily: SANS, transition: "all 0.15s" }}
                >
                  <MicIcon size={12} color={voice ? T.purple : T.textGhost} />
                  <span style={{ fontSize: 11, color: voice ? T.purple : T.textMuted, fontWeight: 500 }}>Agregar voz narrada (ElevenLabs)</span>
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: "transparent", border: `0.5px solid ${T.borderDefault}`, borderRadius: 20, cursor: "pointer", fontFamily: SANS }}>
                  <ImageIcon size={12} color={T.textGhost} />
                  <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>Seleccionar foto base</span>
                </button>
              </div>
            </Panel>
          </div>

          {/* Right — preview & generate */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>

            {/* Preview card */}
            <Panel style={{ padding: "18px 18px" }}>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Vista previa de config</div>

              {/* Aspect ratio mockup */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                {format === "vertical" && (
                  <div style={{ width: 80, height: 142, borderRadius: 8, border: `1.5px solid ${T.orange}`, background: `${T.orange}08`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SmartphoneIcon size={24} color={T.orange} style={{ opacity: 0.5 }} />
                  </div>
                )}
                {format === "horizontal" && (
                  <div style={{ width: 160, height: 90, borderRadius: 8, border: `1.5px solid ${T.orange}`, background: `${T.orange}08`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MonitorIcon size={24} color={T.orange} style={{ opacity: 0.5 }} />
                  </div>
                )}
                {format === "square" && (
                  <div style={{ width: 120, height: 120, borderRadius: 8, border: `1.5px solid ${T.orange}`, background: `${T.orange}08`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SquareIcon size={24} color={T.orange} style={{ opacity: 0.5 }} />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { l: "Modelo", v: MODELS.find(m => m.id === model)?.nombre ?? model },
                  { l: "Desarrollo", v: selectedDes?.nombre ?? desarrollo },
                  { l: "Tipo", v: VIDEO_TYPES.find(vt => vt.id === videoType)?.label ?? videoType },
                  { l: "Formato", v: FORMATS.find(f => f.id === format)?.label ?? format },
                  { l: "Duración", v: duration },
                  { l: "Narración", v: voice ? "ElevenLabs voz" : "Sin voz" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 11, color: T.textGhost }}>{r.l}</span>
                    <span style={{ fontSize: 11, fontFamily: MONO, color: T.textSecondary, textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.v}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `0.5px solid ${T.borderFaint}`, marginTop: 14, paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textGhost, marginBottom: 4 }}>
                  <span>Créditos estimados</span>
                  <span style={{ fontFamily: MONO, color: T.textSecondary }}>~8 créditos</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textGhost }}>
                  <span>Tiempo estimado</span>
                  <span style={{ fontFamily: MONO, color: T.textSecondary }}>3-5 minutos</span>
                </div>
              </div>
            </Panel>

            {/* Generate button */}
            <button
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #F3611F, #E05A1A)",
                border: "none", borderRadius: T.radiusMd,
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: SANS,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(243,97,31,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                transition: "all 150ms",
              }}
            >
              <SparklesIcon size={16} />
              Generar video
            </button>

            <Panel style={{ padding: "14px 16px", background: `${T.blue}08`, borderColor: `${T.blue}20` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <ZapIcon size={14} color={T.blue} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                  El video se generará a partir de fotos reales del desarrollo. Revisa que las fotos estén cargadas en la carpeta del desarrollo antes de generar.
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ── Tab: Historial ── */}
      {tab === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary bar */}
          <Panel style={{ padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Videos totales", val: HISTORY.length, color: T.textSecondary },
                { label: "Completados", val: HISTORY.filter(h => h.estado === "completado").length, color: T.teal },
                { label: "Procesando", val: HISTORY.filter(h => h.estado === "procesando").length, color: T.orange },
                { label: "Borradores", val: HISTORY.filter(h => h.estado === "borrador").length, color: T.textMuted },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  {i > 0 && <div style={{ width: "0.5px", background: T.borderFaint }} />}
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontFamily: MONO, color: s.color, fontWeight: 700 }}>{s.val}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Panel>

          {/* Video grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {HISTORY.map(v => {
              const status = STATUS_CONFIG[v.estado];
              const StatusIcon = status.icon;
              return (
                <Panel key={v.id} style={{ padding: 0, overflow: "hidden" }}>
                  {/* Thumbnail */}
                  <div style={{
                    height: 140,
                    background: `linear-gradient(135deg, ${v.thumbnail}20, ${v.thumbnail}05)`,
                    borderBottom: `0.5px solid ${T.borderFaint}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}>
                    {v.logo ? (
                      <Image src={v.logo} alt={v.desarrollo} width={100} height={50} style={{ objectFit: "contain", opacity: 0.7 }} />
                    ) : (
                      <FilmIcon size={32} color={v.thumbnail} style={{ opacity: 0.3 }} />
                    )}
                    {/* Status badge overlay */}
                    <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(0,0,0,0.7)", borderRadius: 20 }}>
                      <StatusIcon size={10} color={status.color} />
                      <span style={{ fontSize: 10, color: status.color, fontWeight: 600 }}>{status.label}</span>
                    </div>
                    {/* Format badge */}
                    <div style={{ position: "absolute", bottom: 10, left: 10, padding: "3px 8px", background: "rgba(0,0,0,0.7)", borderRadius: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: MONO, color: "rgba(255,255,255,0.7)" }}>{v.formato} · {v.duracion}</span>
                    </div>
                    {/* Play button if complete */}
                    {v.estado === "completado" && (
                      <button style={{ position: "absolute", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" }}>
                        <PlayIcon size={16} color="white" />
                      </button>
                    )}
                    {v.estado === "procesando" && <ProcessingBar />}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{v.titulo}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 9, padding: "2px 7px", background: "rgba(255,255,255,0.06)", borderRadius: 10, color: T.textGhost, fontFamily: MONO }}>{v.modelo}</span>
                        <span style={{ fontSize: 9, padding: "2px 7px", background: "rgba(255,255,255,0.06)", borderRadius: 10, color: T.textGhost, fontFamily: MONO }}>{v.tipo}</span>
                      </div>
                      <span style={{ fontSize: 10, color: T.textGhost, fontFamily: MONO }}>{v.fecha.slice(5)}</span>
                    </div>
                    {v.estado === "completado" && (
                      <button style={{ width: "100%", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", border: `0.5px solid ${T.borderDefault}`, borderRadius: 8, color: T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: SANS }}>
                        <DownloadIcon size={12} />
                        Descargar
                      </button>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
