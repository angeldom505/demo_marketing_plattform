"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, { useState } from "react";
import {
  ImageIcon, LayersIcon, FileTextIcon, PaletteIcon,
  DownloadIcon, CheckCircleIcon, ClockIcon, EditIcon,
  ZapIcon, MonitorIcon, SmartphoneIcon, MailIcon,
} from "lucide-react";
import { T } from "@/styles/tokens";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Demo data ──────────────────────────────────────────────────────────────────

const FORMATS = [
  {
    name: "Post cuadrado",
    dims: "1080 × 1080",
    ratio: "1:1",
    platform: "Instagram · Facebook",
    icon: MonitorIcon,
    aspectW: 1,
    aspectH: 1,
    usage: "Feed orgánico y pauta",
    fileType: "JPG / PNG",
    maxSize: "30 MB",
    count: 47,
  },
  {
    name: "Story / Reel vertical",
    dims: "1080 × 1920",
    ratio: "9:16",
    platform: "Instagram · TikTok · Facebook",
    icon: SmartphoneIcon,
    aspectW: 9,
    aspectH: 16,
    usage: "Stories, Reels, TikTok orgánico",
    fileType: "MP4 / JPG",
    maxSize: "4 GB (video)",
    count: 31,
  },
  {
    name: "Portrait feed",
    dims: "1080 × 1350",
    ratio: "4:5",
    platform: "Instagram · Facebook Ads",
    icon: SmartphoneIcon,
    aspectW: 4,
    aspectH: 5,
    usage: "Feed Instagram, mayor superficie visual",
    fileType: "JPG / PNG",
    maxSize: "30 MB",
    count: 22,
  },
  {
    name: "Banner horizontal",
    dims: "1200 × 628",
    ratio: "1.91:1",
    platform: "Meta Ads · Google Display",
    icon: MonitorIcon,
    aspectW: 1.91,
    aspectH: 1,
    usage: "Facebook/Instagram Ads, display",
    fileType: "JPG / PNG",
    maxSize: "1 MB",
    count: 38,
  },
  {
    name: "Email header",
    dims: "600 × 200",
    ratio: "3:1",
    platform: "Email marketing",
    icon: MailIcon,
    aspectW: 3,
    aspectH: 1,
    usage: "Cabecera de newsletters y secuencias",
    fileType: "JPG / PNG",
    maxSize: "200 KB",
    count: 14,
  },
  {
    name: "Banner web hero",
    dims: "1920 × 1080",
    ratio: "16:9",
    platform: "Web · Blog · Presentaciones",
    icon: MonitorIcon,
    aspectW: 16,
    aspectH: 9,
    usage: "Portadas, blog, OGP, decks",
    fileType: "JPG / PNG / WebP",
    maxSize: "500 KB",
    count: 19,
  },
];

const ASSETS = [
  {
    id: 1,
    nombre: "Aukena — Atardecer terraza principal",
    desarrollo: "AUKENA",
    tipo: "Foto",
    formato: "Post cuadrado",
    estado: "aprobado",
    fecha: "2026-05-18",
    plataforma: "Instagram",
    color: T.orange,
  },
  {
    id: 2,
    nombre: "Aukena — Alberca infinity vista mar",
    desarrollo: "AUKENA",
    tipo: "Foto",
    formato: "Story vertical",
    estado: "aprobado",
    fecha: "2026-05-17",
    plataforma: "Instagram",
    color: T.orange,
  },
  {
    id: 3,
    nombre: "Turquesa — Fachada norte tarde",
    desarrollo: "TURQUESA",
    tipo: "Foto",
    formato: "Banner horizontal",
    estado: "en revisión",
    fecha: "2026-05-20",
    plataforma: "Meta Ads",
    color: T.blue,
  },
  {
    id: 4,
    nombre: "Bonza — Jardín amenidades",
    desarrollo: "BONZA",
    tipo: "Foto",
    formato: "Post cuadrado",
    estado: "aprobado",
    fecha: "2026-05-15",
    plataforma: "Facebook",
    color: T.teal,
  },
  {
    id: 5,
    nombre: "Aukena — Recorrido video 60s",
    desarrollo: "AUKENA",
    tipo: "Video",
    formato: "Story / Reel vertical",
    estado: "borrador",
    fecha: "2026-05-22",
    plataforma: "TikTok",
    color: T.orange,
  },
  {
    id: 6,
    nombre: "Meriden — Render sala modelo",
    desarrollo: "MERIDEN",
    tipo: "Render",
    formato: "Portrait feed",
    estado: "aprobado",
    fecha: "2026-05-14",
    plataforma: "Instagram",
    color: T.purple,
  },
  {
    id: 7,
    nombre: "Central Park — Hero web enero",
    desarrollo: "CENTRAL PARK",
    tipo: "Composición",
    formato: "Banner web hero",
    estado: "archivado",
    fecha: "2026-01-10",
    plataforma: "Web",
    color: T.amber,
  },
  {
    id: 8,
    nombre: "Newsletter Q2",
    desarrollo: "Corporativo",
    tipo: "Composición",
    formato: "Email header",
    estado: "aprobado",
    fecha: "2026-04-01",
    plataforma: "Email",
    color: T.textMuted,
  },
];

const BRIEFS = [
  {
    id: 1,
    titulo: "Campaña Preventa Aukena — Junio 2026",
    desarrollo: "AUKENA",
    objetivo: "Generar 150 leads calificados para unidades B1-B3",
    estado: "activo",
    responsable: "Equipo Creativo",
    entrega: "2026-05-30",
    piezas: 12,
    color: T.orange,
    tono: ["Aspiracional", "Premium", "Naturaleza"],
    paleta: [T.orange, "#1B4332", "#F8F4E3", "#2D6A4F"],
    briefItems: [
      "4 posts cuadrados para feed",
      "3 stories/reels verticales",
      "2 banners horizontal para ads",
      "2 variantes email header",
      "1 hero web landing",
    ],
  },
  {
    id: 2,
    titulo: "Lanzamiento Turquesa — Digital",
    desarrollo: "TURQUESA",
    objetivo: "Awareness de nuevo desarrollo en Cancún, 500K impresiones primera semana",
    estado: "en preparación",
    responsable: "Equipo Creativo",
    entrega: "2026-06-15",
    piezas: 8,
    color: T.blue,
    tono: ["Fresco", "Accesible", "Familiar"],
    paleta: [T.blue, "#00BCD4", "#F0F4FF", "#0D47A1"],
    briefItems: [
      "3 posts cuadrados feed",
      "2 stories verticales",
      "2 banners horizontal ads",
      "1 hero web",
    ],
  },
  {
    id: 3,
    titulo: "Bonza — Reactivación Mayo",
    desarrollo: "BONZA",
    objetivo: "Reactivar leads fríos con contenido de amenidades y precio",
    estado: "completado",
    responsable: "Equipo Creativo",
    entrega: "2026-05-10",
    piezas: 6,
    color: T.teal,
    tono: ["Sereno", "Natural", "Familiar"],
    paleta: [T.teal, "#2E7D32", "#F1F8E9", "#1B5E20"],
    briefItems: [
      "2 posts cuadrados feed",
      "2 stories verticales",
      "1 banner horizontal",
      "1 email header",
    ],
  },
];

const BRAND_COLORS = [
  { nombre: "Naranja primario", hex: "#E85D26", uso: "Acento primario, CTAs, highlights" },
  { nombre: "Teal éxito", hex: "#1D9E75", uso: "Logros, leads, estados positivos" },
  { nombre: "Púrpura", hex: "#7F77DD", uso: "Creatividad, conceptos, briefs" },
  { nombre: "Azul datos", hex: "#4A90D9", uso: "Analytics, portales, datos" },
  { nombre: "Ámbar alerta", hex: "#C47F1A", uso: "Borradores, pendientes, alertas" },
  { nombre: "Fondo panel", hex: "#0f1117", uso: "Superficie principal de cards" },
  { nombre: "Fondo sutil", hex: "#1a1d27", uso: "Fondos secundarios, tablas" },
  { nombre: "Borde default", hex: "#2a2d3a", uso: "Bordes de componentes" },
];

const TABS = ["Formatos", "Biblioteca de assets", "Briefs activos", "Brand guidelines"] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
  aprobado: T.teal,
  "en revisión": T.amber,
  borrador: T.textMuted,
  archivado: T.borderDefault,
  activo: T.teal,
  "en preparación": T.blue,
  completado: T.textGhost,
};

const STATUS_ICONS: Record<string, React.FC<{ size: number; color: string }>> = {
  aprobado: CheckCircleIcon as any,
  activo: CheckCircleIcon as any,
  "en revisión": ClockIcon as any,
  "en preparación": ClockIcon as any,
  borrador: EditIcon as any,
  archivado: LayersIcon as any,
  completado: CheckCircleIcon as any,
};

// ── Components ─────────────────────────────────────────────────────────────────

function Panel({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      background: T.bgPanel,
      border: `0.5px solid ${T.borderDefault}`,
      borderRadius: T.radiusLg,
      fontFamily: SANS,
      ...style,
    }}>
      {children}
    </div>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const color = STATUS_COLORS[estado] ?? T.textMuted;
  const Icon = STATUS_ICONS[estado] ?? ClockIcon;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: `${color}15`, border: `0.5px solid ${color}40`, borderRadius: 20, whiteSpace: "nowrap" }}>
      <Icon size={9} color={color} />
      <span style={{ fontSize: 10, color, fontWeight: 600, textTransform: "capitalize", fontFamily: SANS }}>{estado}</span>
    </div>
  );
}

function AspectBox({ w, h, color }: { w: number; h: number; color: string }) {
  const maxW = 60;
  const maxH = 52;
  const scale = Math.min(maxW / w, maxH / h, 1);
  const bw = Math.round(w * scale);
  const bh = Math.round(h * scale);
  return (
    <div style={{ width: maxW, height: maxH, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ width: bw, height: bh, border: `1.5px solid ${color}`, borderRadius: 3, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ImageIcon size={10} color={color} style={{ opacity: 0.6 }} />
      </div>
    </div>
  );
}

// ── Tab: Formatos ──────────────────────────────────────────────────────────────

function FormatosTab() {
  const total = FORMATS.reduce((s, f) => s + f.count, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Formatos activos", value: FORMATS.length, color: T.orange },
          { label: "Assets totales", value: total, color: T.teal },
          { label: "Plataformas", value: 5, color: T.purple },
        ].map(s => (
          <Panel key={s.label} style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontFamily: MONO, color: s.color, fontWeight: 700 }}>{s.value}</div>
          </Panel>
        ))}
      </div>

      {/* Format cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {FORMATS.map(f => {
          const Icon = f.icon;
          const normalH = (f.aspectH / Math.max(f.aspectW, f.aspectH)) * 52;
          const normalW = (f.aspectW / Math.max(f.aspectW, f.aspectH)) * 60;
          return (
            <Panel key={f.name} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <AspectBox w={f.aspectW} h={f.aspectH} color={T.orange} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600, marginBottom: 3 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: T.textGhost, lineHeight: 1.5 }}>{f.platform}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { l: "Dimensiones", v: f.dims },
                  { l: "Ratio", v: f.ratio },
                  { l: "Formato", v: f.fileType },
                  { l: "Tamaño máx.", v: f.maxSize },
                ].map(d => (
                  <div key={d.l}>
                    <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{d.l}</div>
                    <div style={{ fontSize: 11, fontFamily: MONO, color: T.textMuted }}>{d.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `0.5px solid ${T.borderFaint}`, paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: T.textGhost }}>{f.usage}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <LayersIcon size={9} color={T.orange} />
                  <span style={{ fontSize: 10, fontFamily: MONO, color: T.orange }}>{f.count} assets</span>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Coming soon */}
      <Panel style={{ padding: "16px 20px", background: `${T.orange}08`, borderColor: `${T.orange}20` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ZapIcon size={18} color={T.orange} />
          <div>
            <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600, marginBottom: 2 }}>Generación visual con IA próximamente</div>
            <div style={{ fontSize: 12, color: T.textSecondary }}>Flux 2 Pro vía fal.ai — transformación de fotos reales · adaptación automática por formato</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ── Tab: Biblioteca ────────────────────────────────────────────────────────────

function BibliotecaTab() {
  const [tipoFilter, setTipoFilter] = useState<string>("Todos");
  const tipos = ["Todos", "Foto", "Video", "Render", "Composición"];

  const filtered = tipoFilter === "Todos" ? ASSETS : ASSETS.filter(a => a.tipo === tipoFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: T.textGhost, fontFamily: MONO, marginRight: 4 }}>Tipo:</span>
        {tipos.map(t => (
          <button key={t} onClick={() => setTipoFilter(t)} style={{ height: 28, padding: "0 12px", background: tipoFilter === t ? T.orange : "transparent", border: `0.5px solid ${tipoFilter === t ? "transparent" : T.borderDefault}`, borderRadius: 20, color: tipoFilter === t ? "#fff" : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
            {t}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: T.textGhost, fontFamily: MONO }}>{filtered.length} assets</span>
      </div>

      {/* Table */}
      <Panel style={{ padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 80px 130px 90px 100px 80px", gap: 8, padding: "10px 20px", borderBottom: `0.5px solid ${T.borderDefault}`, background: T.bgSubtle }}>
          {["Asset", "Desarrollo", "Tipo", "Formato", "Plataforma", "Estado", "Fecha"].map((h, i) => (
            <span key={h} style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO, textAlign: i === 0 ? "left" : "center" }}>{h}</span>
          ))}
        </div>
        {filtered.map((a, i) => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 100px 80px 130px 90px 100px 80px", gap: 8, padding: "11px 20px", borderBottom: i < filtered.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", alignItems: "center", borderLeft: `3px solid ${a.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: `${a.color}15`, border: `0.5px solid ${a.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ImageIcon size={12} color={a.color} />
              </div>
              <span style={{ fontSize: 12, color: T.textPrimary, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nombre}</span>
            </div>
            <span style={{ fontSize: 10, color: a.color, fontFamily: MONO, textAlign: "center", fontWeight: 600 }}>{a.desarrollo}</span>
            <span style={{ fontSize: 10, color: T.textMuted, textAlign: "center", fontFamily: SANS }}>{a.tipo}</span>
            <span style={{ fontSize: 10, color: T.textSecondary, textAlign: "center", fontFamily: SANS }}>{a.formato}</span>
            <span style={{ fontSize: 10, color: T.textMuted, textAlign: "center" }}>{a.plataforma}</span>
            <div style={{ display: "flex", justifyContent: "center" }}><StatusBadge estado={a.estado} /></div>
            <span style={{ fontSize: 10, fontFamily: MONO, color: T.textGhost, textAlign: "center" }}>{a.fecha.slice(5)}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ── Tab: Briefs ────────────────────────────────────────────────────────────────

function BriefsTab() {
  const [selected, setSelected] = useState<number | null>(1);
  const brief = BRIEFS.find(b => b.id === selected);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, minHeight: 500 }}>
      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {BRIEFS.map(b => (
          <Panel key={b.id} style={{ padding: "14px 16px", cursor: "pointer", borderColor: selected === b.id ? `${b.color}60` : T.borderDefault, background: selected === b.id ? `${b.color}08` : T.bgPanel, transition: "all 0.15s" }} onClick={() => setSelected(b.id)}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: b.color, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>{b.titulo}</div>
                <div style={{ fontSize: 10, color: b.color, fontFamily: MONO, fontWeight: 600 }}>{b.desarrollo}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <StatusBadge estado={b.estado} />
              <span style={{ fontSize: 10, fontFamily: MONO, color: T.textGhost }}>{b.piezas} piezas</span>
            </div>
          </Panel>
        ))}
      </div>

      {/* Detail */}
      {brief ? (
        <Panel style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: T.textPrimary, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 6 }}>{brief.titulo}</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <StatusBadge estado={brief.estado} />
                <span style={{ fontSize: 11, color: T.textGhost }}>Entrega: <span style={{ fontFamily: MONO, color: T.textSecondary }}>{brief.entrega}</span></span>
                <span style={{ fontSize: 11, color: T.textGhost }}>Responsable: <span style={{ color: T.textSecondary }}>{brief.responsable}</span></span>
              </div>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 14px", background: "transparent", border: `0.5px solid ${T.borderDefault}`, borderRadius: 8, color: T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: SANS }}>
              <DownloadIcon size={12} /> Descargar brief
            </button>
          </div>

          <div style={{ marginBottom: 20, padding: "14px 16px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}` }}>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Objetivo de campaña</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{brief.objetivo}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Tono */}
            <div>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Tono de comunicación</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {brief.tono.map(t => (
                  <div key={t} style={{ padding: "4px 11px", background: `${brief.color}15`, border: `0.5px solid ${brief.color}40`, borderRadius: 20, fontSize: 11, color: brief.color, fontWeight: 500 }}>{t}</div>
                ))}
              </div>
            </div>
            {/* Paleta */}
            <div>
              <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Paleta de colores</div>
              <div style={{ display: "flex", gap: 8 }}>
                {brief.paleta.map(c => (
                  <div key={c} title={c} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: "0.5px solid rgba(255,255,255,0.1)" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Piezas */}
          <div>
            <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Piezas requeridas ({brief.piezas})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {brief.briefItems.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.bgSubtle, borderRadius: 8, border: `0.5px solid ${T.borderFaint}` }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${brief.color}20`, border: `0.5px solid ${brief.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontFamily: MONO, color: brief.color, fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      ) : (
        <Panel style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: T.textGhost, fontSize: 13 }}>Selecciona un brief</span>
        </Panel>
      )}
    </div>
  );
}

// ── Tab: Brand Guidelines ──────────────────────────────────────────────────────

function BrandTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Colors */}
      <Panel style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 16 }}>Paleta de marca</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {BRAND_COLORS.map(c => (
            <div key={c.hex} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ height: 56, borderRadius: T.radiusMd, background: c.hex, border: "0.5px solid rgba(255,255,255,0.08)", boxShadow: c.hex === T.orange ? `0 0 20px ${T.orange}40` : "none" }} />
              <div>
                <div style={{ fontSize: 11, color: T.textPrimary, fontWeight: 500, marginBottom: 2 }}>{c.nombre}</div>
                <div style={{ fontSize: 10, fontFamily: MONO, color: T.textGhost, marginBottom: 4 }}>{c.hex}</div>
                <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.4 }}>{c.uso}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Typography */}
      <Panel style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 16 }}>Tipografía</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: "18px 20px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}` }}>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Display / Cuerpo</div>
            <div style={{ fontSize: 28, color: T.textPrimary, fontFamily: SANS, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>DM Sans</div>
            <div style={{ fontSize: 13, color: T.textSecondary, fontFamily: SANS, lineHeight: 1.6 }}>
              Nexus Suite — Residencial de calidad para cada etapa de tu vida.
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              {[400, 500, 700, 800].map(w => (
                <div key={w} style={{ padding: "3px 9px", background: `${T.orange}10`, borderRadius: 6, fontSize: 10, fontFamily: MONO, color: T.textMuted }}>{w}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: "18px 20px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}` }}>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Datos / Métricas</div>
            <div style={{ fontSize: 28, color: T.orange, fontFamily: MONO, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 8 }}>IBM Plex Mono</div>
            <div style={{ fontSize: 13, color: T.textMuted, fontFamily: MONO, lineHeight: 1.6 }}>
              8,347 leads · $157 CPL · 34.2% apertura
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              {[400, 500].map(w => (
                <div key={w} style={{ padding: "3px 9px", background: `${T.orange}10`, borderRadius: 6, fontSize: 10, fontFamily: MONO, color: T.textMuted }}>{w}</div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Voice & Tone */}
      <Panel style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 16 }}>Voz y tono</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {[
            { p: "Aspiracional", d: "Habla de posibilidades, no de características técnicas", color: T.orange },
            { p: "Cercano", d: "Sin jerga técnica. Directo, humano, sin formalismos excesivos", color: T.teal },
            { p: "Confiable", d: "Basado en hechos reales del desarrollo, sin promesas vacías", color: T.blue },
            { p: "Diferenciado", d: "Cada desarrollo tiene su propia identidad, no copiar plantillas", color: T.purple },
            { p: "Orientado a acción", d: "Cada pieza termina con un CTA claro y relevante", color: T.amber },
          ].map(v => (
            <div key={v.p} style={{ padding: "14px 14px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}`, borderTop: `3px solid ${v.color}` }}>
              <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600, marginBottom: 8 }}>{v.p}</div>
              <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{v.d}</div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Downloads */}
      <Panel style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 16 }}>Recursos descargables</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { nombre: "Brand Kit completo", desc: "Logos, colores, tipografías, iconos", size: "14.2 MB", tipo: "ZIP" },
            { nombre: "Plantillas Canva editables", desc: "Posts, stories, banners por formato", size: "8.7 MB", tipo: "CANVA" },
            { nombre: "Guidelines PDF", desc: "Manual de marca versión Q2 2026", size: "3.4 MB", tipo: "PDF" },
          ].map(r => (
            <div key={r.nombre} style={{ padding: "14px 16px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${T.orange}15`, border: `0.5px solid ${T.orange}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileTextIcon size={16} color={T.orange} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 500, marginBottom: 3 }}>{r.nombre}</div>
                <div style={{ fontSize: 10, color: T.textGhost }}>{r.desc}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontFamily: MONO, color: T.orange, background: `${T.orange}15`, padding: "2px 7px", borderRadius: 4 }}>{r.tipo}</span>
                <span style={{ fontSize: 9, color: T.textGhost, fontFamily: MONO }}>{r.size}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DisenoPage() {
  const [tab, setTab] = useState<Tab>("Formatos");

  const totalAssets = ASSETS.length;
  const aprobados = ASSETS.filter(a => a.estado === "aprobado").length;
  const pendientes = ASSETS.filter(a => a.estado === "en revisión" || a.estado === "borrador").length;

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: SANS }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, color: T.textPrimary, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: SANS }}>Diseño</h1>
          <p style={{ margin: "4px 0 0", color: T.textSecondary, fontSize: 13 }}>Formatos · Assets · Briefs visuales · Brand guidelines</p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[
            { label: "Assets totales", val: totalAssets, color: T.textSecondary },
            { label: "Aprobados", val: aprobados, color: T.teal },
            { label: "Pendientes", val: pendientes, color: T.amber },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontFamily: MONO, color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: `0.5px solid ${T.borderFaint}`, paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ height: 36, padding: "0 16px", background: "transparent", border: "none", borderBottom: tab === t ? `2px solid ${T.orange}` : "2px solid transparent", color: tab === t ? T.textPrimary : T.textMuted, fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: "pointer", fontFamily: SANS, marginBottom: -1, transition: "all 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "Formatos" && <FormatosTab />}
      {tab === "Biblioteca de assets" && <BibliotecaTab />}
      {tab === "Briefs activos" && <BriefsTab />}
      {tab === "Brand guidelines" && <BrandTab />}
    </div>
  );
}
