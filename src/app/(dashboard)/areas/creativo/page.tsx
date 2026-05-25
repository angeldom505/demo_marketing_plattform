"use client";

import React, { useState } from "react";
import { T } from "@/styles/tokens";
import {
  PaletteIcon,
  LayoutIcon,
  BookOpenIcon,
  ChevronRightIcon,
  LayersIcon,
  TypeIcon,
  MicIcon,
  DownloadIcon,
  CheckCircle2Icon,
  ClockIcon,
  CircleDotIcon,
} from "lucide-react";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Data ────────────────────────────────────────────────────────────────────

const BRIEFS = [
  {
    slug: "aukena",
    nombre: "Aukena",
    region: "Quintana Roo",
    color: "#0EA5E9",
    tagline: "El Caribe no es destino. Es tu dirección.",
    concepto: "Lujo discreto frente al mar. Para quienes eligen vivir diferente.",
    tono: ["Aspiracional", "Sofisticado", "Exclusivo"],
    paleta: ["#0EA5E9", "#1E293B", "#F8FAFC", "#E85D26"],
    tipografia: "DM Sans + IBM Plex Mono",
    estado: "completo",
    piezas_activas: 24,
    campana_actual: "Preventa Q2 2026",
  },
  {
    slug: "turquesa",
    nombre: "Turquesa",
    region: "Quintana Roo",
    color: "#06B6D4",
    tagline: "Playa del Carmen a minutos de casa.",
    concepto: "Accesible sin renunciar al Caribe. Espacio para vivir, no solo visitar.",
    tono: ["Cálido", "Cercano", "Vital"],
    paleta: ["#06B6D4", "#0E7490", "#ECFEFF", "#F59E0B"],
    tipografia: "DM Sans",
    estado: "en-progreso",
    piezas_activas: 12,
    campana_actual: "Lanzamiento Mayo 2026",
  },
  {
    slug: "bonza",
    nombre: "Bonza",
    region: "Querétaro",
    color: "#8B5CF6",
    tagline: "Querétaro tiene todo lo que buscas.",
    concepto: "Vertical moderno en el corredor industrial más dinámico del Bajío.",
    tono: ["Profesional", "Moderno", "Sólido"],
    paleta: ["#8B5CF6", "#4C1D95", "#F5F3FF", "#E85D26"],
    tipografia: "DM Sans",
    estado: "en-progreso",
    piezas_activas: 8,
    campana_actual: "Q3 2026",
  },
  {
    slug: "meriden",
    nombre: "Meriden",
    region: "Yucatán",
    color: "#10B981",
    tagline: "Mérida Norte: donde vive el futuro.",
    concepto: "Residencial en la zona de mayor plusvalía de Mérida. Inversión segura.",
    tono: ["Seguro", "Aspiracional", "Sólido"],
    paleta: ["#10B981", "#065F46", "#ECFDF5", "#F59E0B"],
    tipografia: "DM Sans + IBM Plex Mono",
    estado: "en-progreso",
    piezas_activas: 6,
    campana_actual: "En desarrollo",
  },
  {
    slug: "central-park-bosque-real",
    nombre: "Central Park",
    region: "Estado de México",
    color: "#EC4899",
    tagline: "Huixquilucan redefinido.",
    concepto: "El único desarrollo premium en Bosque Real con vista a la sierra.",
    tono: ["Premium", "Exclusivo", "Urbano"],
    paleta: ["#EC4899", "#831843", "#FDF2F8", "#E85D26"],
    tipografia: "DM Sans",
    estado: "borrador",
    piezas_activas: 3,
    campana_actual: "Por definir",
  },
] as const;

const CONCEPTOS = [
  { id: 1, titulo: "El Caribe como estilo de vida", desarrollo: "Aukena", tipo: "Campaña awareness", canal: "Meta + Google", estado: "activo", fecha: "Mar – Jun 2026" },
  { id: 2, titulo: "Lanzamiento Turquesa PDC", desarrollo: "Turquesa", tipo: "Lanzamiento", canal: "Meta + Email", estado: "activo", fecha: "May – Jul 2026" },
  { id: 3, titulo: "Preventa Bonza Vertical", desarrollo: "Bonza", tipo: "Preventa", canal: "Meta + LinkedIn", estado: "planeado", fecha: "Jul – Sep 2026" },
  { id: 4, titulo: "Newsletter Mayo HU", desarrollo: "Todos", tipo: "Email masivo", canal: "Email", estado: "activo", fecha: "May 2026" },
];

const BRAND_COLORS = [
  { name: "HU Orange", hex: "#E85D26", label: "Principal" },
  { name: "Charcoal", hex: "#2F2F2F", label: "Oscuro" },
  { name: "White", hex: "#FFFFFF", label: "Texto claro" },
  { name: "Burnt Orange", hex: "#C0441B", label: "Secundario" },
];

const VOICE_PRINCIPLES = [
  {
    title: "Directo y preciso",
    desc: "Sin rodeos. Cada palabra tiene peso. No escribimos para llenar espacio; escribimos para mover a quien lee.",
  },
  {
    title: "Aspiracional con sustancia",
    desc: "Elevamos el tono sin perder la verdad. El lujo o la accesibilidad son reales — no marketing vacío.",
  },
  {
    title: "Específico por desarrollo",
    desc: "El Caribe de Aukena no suena igual que Querétaro de Bonza. Cada voz nace del lugar y su audiencia.",
  },
  {
    title: "Humano y cercano",
    desc: "Hablamos de hogares, no de unidades. De familias y proyectos de vida, no de metros cuadrados.",
  },
  {
    title: "Con urgencia estratégica",
    desc: "Sin presión artificial. La urgencia viene de la oportunidad real: preventa, plusvalía, disponibilidad.",
  },
];

const ASSET_CARDS = [
  { nombre: "Logo HU principal", formato: "SVG · PNG", nota: "Fondo oscuro y claro" },
  { nombre: "Isotipo HU", formato: "SVG · PNG", nota: "Versión cuadrada y circular" },
  { nombre: "Tipografías HU", formato: "OTF · WOFF2", nota: "DM Sans + IBM Plex Mono" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

type EstadoBrief = "completo" | "en-progreso" | "borrador";
type EstadoConcepto = "activo" | "planeado" | "pausado";

function estadoBriefBadge(estado: EstadoBrief) {
  const map: Record<EstadoBrief, { label: string; color: string; bg: string }> = {
    completo:     { label: "Completo",     color: T.teal,  bg: T.tealBg },
    "en-progreso":{ label: "En progreso",  color: T.blue,  bg: T.blueBg },
    borrador:     { label: "Borrador",     color: T.amber, bg: T.amberBg },
  };
  return map[estado] ?? map["borrador"];
}

function estadoConceptoBadge(estado: EstadoConcepto) {
  const map: Record<EstadoConcepto, { label: string; color: string; bg: string }> = {
    activo:   { label: "Activo",   color: T.teal,  bg: T.tealBg },
    planeado: { label: "Planeado", color: T.blue,  bg: T.blueBg },
    pausado:  { label: "Pausado",  color: T.amber, bg: T.amberBg },
  };
  return map[estado] ?? map["planeado"];
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatChip({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 20,
        background: T.bgSubtle,
        border: `1px solid ${T.borderDefault}`,
        fontFamily: SANS,
      }}
    >
      <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 700 }}>{value}</span>
      <span style={{ color: T.textMuted, fontSize: 12 }}>{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: T.textSecondary,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: MONO,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

// ── Tab: Briefs por desarrollo ────────────────────────────────────────────────

function BriefCard({ brief }: { brief: typeof BRIEFS[number] }) {
  const [hovered, setHovered] = useState(false);
  const badge = estadoBriefBadge(brief.estado as EstadoBrief);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: T.radiusLg,
        background: T.bgPanel,
        border: `1px solid ${hovered ? hexToRgba(brief.color, 0.3) : T.borderDefault}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 180ms, box-shadow 180ms",
        boxShadow: hovered ? `0 0 0 1px ${hexToRgba(brief.color, 0.15)}, 0 8px 32px rgba(0,0,0,0.4)` : "none",
        fontFamily: SANS,
      }}
    >
      {/* Color header */}
      <div
        style={{
          padding: "18px 20px 16px",
          background: `linear-gradient(135deg, ${hexToRgba(brief.color, 0.18)} 0%, ${hexToRgba(brief.color, 0.07)} 100%)`,
          borderBottom: `1px solid ${hexToRgba(brief.color, 0.2)}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          position: "relative",
        }}
      >
        {/* Color accent strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${brief.color} 0%, ${hexToRgba(brief.color, 0.4)} 100%)`,
          }}
        />
        <div>
          <div style={{ color: T.textPrimary, fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {brief.nombre}
          </div>
          <div style={{ color: T.textMuted, fontSize: 11.5, marginTop: 2 }}>{brief.region}</div>
        </div>
        {/* Estado badge */}
        <span
          style={{
            padding: "3px 9px",
            borderRadius: 20,
            background: badge.bg,
            color: badge.color,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontFamily: MONO,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {/* Tagline */}
        <div
          style={{
            color: T.textPrimary,
            fontSize: 15,
            fontStyle: "italic",
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
          }}
        >
          &ldquo;{brief.tagline}&rdquo;
        </div>

        {/* Concepto */}
        <div style={{ color: T.textSecondary, fontSize: 12.5, lineHeight: 1.5 }}>
          {brief.concepto}
        </div>

        {/* Tono chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {brief.tono.map((t) => (
            <span
              key={t}
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                background: hexToRgba(brief.color, 0.1),
                border: `1px solid ${hexToRgba(brief.color, 0.25)}`,
                color: brief.color,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Paleta swatches */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ color: T.textMuted, fontSize: 10.5, fontFamily: MONO, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Paleta
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {brief.paleta.map((hex) => (
              <div
                key={hex}
                title={hex}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  background: hex,
                  border: hex === "#F8FAFC" || hex === "#ECFEFF" || hex === "#F5F3FF" || hex === "#ECFDF5" || hex === "#FDF2F8"
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "none",
                  flexShrink: 0,
                  cursor: "default",
                }}
              />
            ))}
            <span style={{ color: T.textMuted, fontSize: 10, fontFamily: MONO, marginLeft: 4 }}>
              {brief.tipografia}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${T.borderFaint}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: T.bgSubtle,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LayersIcon size={11} color={T.textMuted} />
            <span style={{ color: T.textSecondary, fontSize: 12 }}>
              <span style={{ color: T.textPrimary, fontWeight: 700 }}>{brief.piezas_activas}</span> piezas activas
            </span>
          </div>
          <div style={{ color: T.textMuted, fontSize: 11, fontFamily: MONO }}>{brief.campana_actual}</div>
        </div>

        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: T.radiusSm,
            background: hexToRgba(brief.color, 0.1),
            border: `1px solid ${hexToRgba(brief.color, 0.25)}`,
            color: brief.color,
            fontSize: 11.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: SANS,
            transition: "background 150ms",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = hexToRgba(brief.color, 0.2);
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = hexToRgba(brief.color, 0.1);
          }}
        >
          Ver brief
          <ChevronRightIcon size={12} />
        </button>
      </div>
    </div>
  );
}

function BriefsTab() {
  const totalPiezas = BRIEFS.reduce((sum, b) => sum + b.piezas_activas, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Summary row */}
      <div style={{ display: "flex", gap: 10 }}>
        <div
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: T.radiusMd,
            background: T.bgSubtle,
            border: `1px solid ${T.borderFaint}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <CheckCircle2Icon size={16} color={T.teal} />
          <div>
            <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>1 brief completo</div>
            <div style={{ color: T.textMuted, fontSize: 11.5 }}>Aukena — identidad validada</div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: T.radiusMd,
            background: T.bgSubtle,
            border: `1px solid ${T.borderFaint}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ClockIcon size={16} color={T.blue} />
          <div>
            <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>3 en progreso</div>
            <div style={{ color: T.textMuted, fontSize: 11.5 }}>Turquesa · Bonza · Meriden</div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: T.radiusMd,
            background: T.bgSubtle,
            border: `1px solid ${T.borderFaint}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <CircleDotIcon size={16} color={T.orange} />
          <div>
            <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{totalPiezas} piezas</div>
            <div style={{ color: T.textMuted, fontSize: 11.5 }}>Activas en todos los desarrollos</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {BRIEFS.map((b) => (
          <BriefCard key={b.slug} brief={b} />
        ))}
      </div>
    </div>
  );
}

// ── Tab: Conceptos activos ────────────────────────────────────────────────────

function ConceptosTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr 0.9fr 1fr",
          padding: "10px 20px",
          borderRadius: `${T.radiusMd} ${T.radiusMd} 0 0`,
          background: T.bgSubtle,
          border: `1px solid ${T.borderDefault}`,
          borderBottom: "none",
        }}
      >
        {["Concepto", "Desarrollo", "Tipo", "Canal", "Estado", "Período"].map((col) => (
          <div
            key={col}
            style={{
              color: T.textMuted,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: MONO,
            }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Table rows */}
      <div
        style={{
          borderRadius: `0 0 ${T.radiusLg} ${T.radiusLg}`,
          border: `1px solid ${T.borderDefault}`,
          overflow: "hidden",
        }}
      >
        {CONCEPTOS.map((c, i) => {
          const badge = estadoConceptoBadge(c.estado as EstadoConcepto);
          const isLast = i === CONCEPTOS.length - 1;

          return (
            <ConceptoRow key={c.id} concepto={c} badge={badge} isLast={isLast} />
          );
        })}
      </div>
    </div>
  );
}

function ConceptoRow({
  concepto,
  badge,
  isLast,
}: {
  concepto: typeof CONCEPTOS[number];
  badge: { label: string; color: string; bg: string };
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr 0.9fr 1fr",
        padding: "14px 20px",
        alignItems: "center",
        background: hovered ? T.bgSubtle : T.bgPanel,
        borderBottom: isLast ? "none" : `1px solid ${T.borderFaint}`,
        transition: "background 120ms",
        fontFamily: SANS,
        cursor: "default",
      }}
    >
      <div style={{ color: T.textPrimary, fontSize: 13.5, fontWeight: 600 }}>
        {concepto.titulo}
      </div>
      <div style={{ color: T.textSecondary, fontSize: 13 }}>{concepto.desarrollo}</div>
      <div style={{ color: T.textMuted, fontSize: 12 }}>{concepto.tipo}</div>
      <div>
        <span
          style={{
            padding: "3px 8px",
            borderRadius: 5,
            background: T.bgSubtle,
            border: `1px solid ${T.borderFaint}`,
            color: T.textSecondary,
            fontSize: 11,
            fontFamily: MONO,
          }}
        >
          {concepto.canal}
        </span>
      </div>
      <div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 20,
            background: badge.bg,
            color: badge.color,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontFamily: MONO,
          }}
        >
          {badge.label}
        </span>
      </div>
      <div style={{ color: T.textMuted, fontSize: 11.5, fontFamily: MONO }}>{concepto.fecha}</div>
    </div>
  );
}

// ── Tab: Lineamientos HU ─────────────────────────────────────────────────────

function LineamientosTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Brand colors */}
      <section>
        <SectionLabel>Paleta de marca HU</SectionLabel>
        <div
          style={{
            padding: "24px",
            borderRadius: T.radiusLg,
            background: T.bgPanel,
            border: `1px solid ${T.borderDefault}`,
            display: "flex",
            gap: 16,
          }}
        >
          {BRAND_COLORS.map((c) => (
            <div key={c.hex} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  height: 72,
                  borderRadius: T.radiusMd,
                  background: c.hex,
                  border: c.hex === "#FFFFFF" ? `1px solid ${T.borderEmphasis}` : "none",
                  boxShadow: c.hex === "#E85D26" ? "0 4px 20px rgba(232,93,38,0.35)" : "none",
                }}
              />
              <div>
                <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: SANS }}>
                  {c.name}
                </div>
                <div style={{ color: T.textMuted, fontSize: 10.5, fontFamily: SANS, marginBottom: 2 }}>
                  {c.label}
                </div>
                <div style={{ color: T.textMuted, fontSize: 10.5, fontFamily: MONO, letterSpacing: "0.06em" }}>
                  {c.hex}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionLabel>Sistema tipográfico</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* DM Sans */}
          <div
            style={{
              padding: "22px 24px",
              borderRadius: T.radiusLg,
              background: T.bgPanel,
              border: `1px solid ${T.borderDefault}`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <TypeIcon size={14} color={T.orange} />
              <span style={{ color: T.textMuted, fontSize: 10.5, fontFamily: MONO, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Primaria — cuerpo y titulares
              </span>
            </div>
            <div style={{ fontFamily: SANS, color: T.textPrimary, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              DM Sans
            </div>
            <div style={{ fontFamily: SANS, color: T.textSecondary, fontSize: 14, lineHeight: 1.6, fontWeight: 400 }}>
              Diseñada para pantallas de alta resolución. Geometría limpia, legible en tamaños pequeños y grandes.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {["Regular 400", "Medium 500", "Bold 700", "ExtraBold 800"].map((w) => (
                <span
                  key={w}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: T.bgSubtle,
                    border: `1px solid ${T.borderFaint}`,
                    color: T.textMuted,
                    fontSize: 10.5,
                    fontFamily: MONO,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* IBM Plex Mono */}
          <div
            style={{
              padding: "22px 24px",
              borderRadius: T.radiusLg,
              background: T.bgPanel,
              border: `1px solid ${T.borderDefault}`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <TypeIcon size={14} color={T.purple} />
              <span style={{ color: T.textMuted, fontSize: 10.5, fontFamily: MONO, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Secundaria — datos y etiquetas
              </span>
            </div>
            <div style={{ fontFamily: MONO, color: T.textPrimary, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              IBM Plex Mono
            </div>
            <div style={{ fontFamily: SANS, color: T.textSecondary, fontSize: 14, lineHeight: 1.6, fontWeight: 400 }}>
              Para métricas, códigos, precios y elementos técnicos. Aporta precisión y credibilidad.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {["Regular 400", "Medium 500", "Bold 700"].map((w) => (
                <span
                  key={w}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: T.bgSubtle,
                    border: `1px solid ${T.borderFaint}`,
                    color: T.textMuted,
                    fontSize: 10.5,
                    fontFamily: MONO,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tone of voice */}
      <section>
        <SectionLabel>Principios de voz y tono</SectionLabel>
        <div
          style={{
            borderRadius: T.radiusLg,
            border: `1px solid ${T.borderDefault}`,
            overflow: "hidden",
          }}
        >
          {VOICE_PRINCIPLES.map((p, i) => (
            <VoicePrincipleRow key={p.title} principle={p} index={i} isLast={i === VOICE_PRINCIPLES.length - 1} />
          ))}
        </div>
      </section>

      {/* Assets */}
      <section>
        <SectionLabel>Logos y assets descargables</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {ASSET_CARDS.map((a) => (
            <AssetCard key={a.nombre} asset={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function VoicePrincipleRow({
  principle,
  index,
  isLast,
}: {
  principle: typeof VOICE_PRINCIPLES[number];
  index: number;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = [T.orange, T.teal, T.purple, T.blue, T.amber];
  const accentColor = colors[index % colors.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 16,
        padding: "18px 22px",
        alignItems: "flex-start",
        background: hovered ? T.bgSubtle : T.bgPanel,
        borderBottom: isLast ? "none" : `1px solid ${T.borderFaint}`,
        transition: "background 120ms",
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          fontFamily: MONO,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {index + 1}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {principle.title}
        </div>
        <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.55 }}>
          {principle.desc}
        </div>
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: typeof ASSET_CARDS[number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "20px",
        borderRadius: T.radiusLg,
        background: hovered ? T.bgSubtle : T.bgPanel,
        border: `1px solid ${hovered ? T.borderEmphasis : T.borderDefault}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        transition: "background 150ms, border-color 150ms",
        fontFamily: SANS,
      }}
    >
      {/* Placeholder icon area */}
      <div
        style={{
          height: 56,
          borderRadius: T.radiusMd,
          background: T.bgOverlay,
          border: `1px solid ${T.borderFaint}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PaletteIcon size={22} color={T.textGhost} />
      </div>
      <div>
        <div style={{ color: T.textPrimary, fontSize: 13, fontWeight: 700 }}>{asset.nombre}</div>
        <div style={{ color: T.textMuted, fontSize: 11.5, marginTop: 2 }}>{asset.nota}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 5,
            background: T.bgSubtle,
            border: `1px solid ${T.borderFaint}`,
            color: T.textMuted,
            fontSize: 10,
            fontFamily: MONO,
          }}
        >
          {asset.formato}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: hovered ? T.orange : T.textMuted,
            fontSize: 11.5,
            fontWeight: 600,
            transition: "color 150ms",
          }}
        >
          <DownloadIcon size={12} />
          <span>Descargar</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

type TabId = "briefs" | "conceptos" | "lineamientos";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "briefs",        label: "Briefs por desarrollo", icon: LayoutIcon },
  { id: "conceptos",     label: "Conceptos activos",     icon: BookOpenIcon },
  { id: "lineamientos",  label: "Lineamientos HU",       icon: PaletteIcon },
];

export default function CreativoPage() {
  const [activeTab, setActiveTab] = useState<TabId>("briefs");

  const totalPiezas = BRIEFS.reduce((sum, b) => sum + b.piezas_activas, 0);
  const conceptosActivos = CONCEPTOS.filter((c) => c.estado === "activo").length;

  return (
    <div
      style={{
        padding: "32px 40px 60px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        fontFamily: SANS,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: T.radiusMd,
                background: T.orangeBg,
                border: `1px solid ${T.orangeBd}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PaletteIcon size={16} color={T.orange} />
            </div>
            <h1
              style={{
                margin: 0,
                color: T.textPrimary,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontFamily: SANS,
              }}
            >
              Creativo
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              color: T.textMuted,
              fontSize: 13,
              fontFamily: MONO,
              letterSpacing: "0.02em",
            }}
          >
            Identidad · Briefs · Conceptos · Lineamientos
          </p>
        </div>

        {/* Stats chips */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <StatChip value={BRIEFS.length} label="desarrollos" />
          <StatChip value={totalPiezas} label="piezas activas" />
          <StatChip value={conceptosActivos} label="conceptos" />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${T.borderDefault}`,
          paddingBottom: 0,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 16px",
                borderRadius: `${T.radiusMd} ${T.radiusMd} 0 0`,
                border: "none",
                background: isActive ? T.bgPanel : "transparent",
                color: isActive ? T.textPrimary : T.textMuted,
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                fontFamily: SANS,
                borderBottom: isActive ? `2px solid ${T.orange}` : "2px solid transparent",
                marginBottom: -1,
                transition: "color 150ms, background 150ms",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = T.textSecondary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = T.textMuted;
                }
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "briefs" && <BriefsTab />}
        {activeTab === "conceptos" && <ConceptosTab />}
        {activeTab === "lineamientos" && <LineamientosTab />}
      </div>
    </div>
  );
}
