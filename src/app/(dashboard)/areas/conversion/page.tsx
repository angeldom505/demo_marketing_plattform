"use client";

import React, { useState } from "react";
import {
  MailIcon,
  UsersIcon,
  TrendingUpIcon,
  MousePointerClickIcon,
  CalendarCheckIcon,
  MessageSquareIcon,
  PlusIcon,
  ExternalLinkIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeIcon,
  BarChart2Icon,
} from "lucide-react";
import { T } from "@/styles/tokens";

// ── Fonts ─────────────────────────────────────────────────────────────
const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Types ─────────────────────────────────────────────────────────────
type TabId = "email" | "whatsapp" | "landing";

type EmailSeq = {
  nombre: string;
  desarrollo: string;
  etapa: string;
  emails: number;
  contactos: number;
  apertura: number;
  click: number;
  citas: number;
  estado: "activa" | "pausada";
};

type WaTemplate = {
  nombre: string;
  tipo: "utility" | "marketing";
  status: "aprobado" | "pendiente";
  tasa: number;
};

type Landing = {
  nombre: string;
  url: string;
  visitas: number;
  leads: number;
  conversión: number;
  cpl: number;
};

// ── Demo data ─────────────────────────────────────────────────────────
const EMAIL_SEQS: EmailSeq[] = [
  { nombre: "Nurturing AUKENA · Inversor", desarrollo: "Aukena", etapa: "MQL → SQL", emails: 7, contactos: 342, apertura: 41.2, click: 14.8, citas: 8.4, estado: "activa" },
  { nombre: "Bienvenida Turquesa", desarrollo: "Turquesa", etapa: "Lead → MQL", emails: 5, contactos: 287, apertura: 38.6, click: 12.4, citas: 6.1, estado: "activa" },
  { nombre: "Re-engagement General", desarrollo: "Todos", etapa: "Fría → Tibia", emails: 4, contactos: 512, apertura: 28.4, click: 8.7, citas: 3.2, estado: "activa" },
  { nombre: "Seguimiento Bonza", desarrollo: "Bonza", etapa: "SQL → Cliente", emails: 6, contactos: 134, apertura: 44.7, click: 18.2, citas: 12.7, estado: "activa" },
  { nombre: "Primer Hogar · Jóvenes", desarrollo: "Trojes", etapa: "Lead → MQL", emails: 5, contactos: 198, apertura: 32.1, click: 10.4, citas: 4.8, estado: "activa" },
  { nombre: "Reactivación Morelos", desarrollo: "Santa Fe / Aquasol", etapa: "Inactivo", emails: 3, contactos: 243, apertura: 22.8, click: 6.9, citas: 2.1, estado: "pausada" },
  { nombre: "Cierre Meriden", desarrollo: "Meriden", etapa: "SQL → Cliente", emails: 8, contactos: 89, apertura: 47.3, click: 21.4, citas: 15.7, estado: "activa" },
  { nombre: "Newsletter Mensual HU", desarrollo: "Todos", etapa: "Retención", emails: 1, contactos: 2847, apertura: 31.4, click: 9.2, citas: 0.8, estado: "activa" },
];

const WA_TEMPLATES: WaTemplate[] = [
  { nombre: "Bienvenida Lead", tipo: "utility", status: "aprobado", tasa: 94.2 },
  { nombre: "Invitación Tour Virtual", tipo: "marketing", status: "aprobado", tasa: 67.8 },
  { nombre: "Seguimiento 48h", tipo: "utility", status: "aprobado", tasa: 88.1 },
  { nombre: "Oferta Especial Preventa", tipo: "marketing", status: "aprobado", tasa: 72.4 },
  { nombre: "Confirmación Cita", tipo: "utility", status: "aprobado", tasa: 98.7 },
  { nombre: "Post-Visita Feedback", tipo: "utility", status: "pendiente", tasa: 0 },
];

const LANDINGS: Landing[] = [
  { nombre: "Aukena · Tulum Caribe", url: "aukena.hogaresunion.mx", visitas: 4821, leads: 487, conversión: 10.1, cpl: 142 },
  { nombre: "Turquesa · Playa del Carmen", url: "turquesa.hogaresunion.mx", visitas: 3247, leads: 312, conversión: 9.6, cpl: 156 },
  { nombre: "Bonza · Querétaro", url: "bonza.hogaresunion.mx", visitas: 2134, leads: 178, conversión: 8.3, cpl: 167 },
  { nombre: "Meriden · Mérida Norte", url: "meriden.hogaresunion.mx", visitas: 1876, leads: 134, conversión: 7.1, cpl: 198 },
];

// ── KPI data ──────────────────────────────────────────────────────────
const KPIS = [
  { label: "Secuencias activas", value: "8", icon: MailIcon, color: T.orange },
  { label: "Contactos en flujo", value: "1,847", icon: UsersIcon, color: T.blue },
  { label: "Apertura prom.", value: "34.2%", icon: TrendingUpIcon, color: T.teal },
  { label: "Click rate prom.", value: "11.8%", icon: MousePointerClickIcon, color: T.purple },
  { label: "Conv. a cita", value: "6.4%", icon: CalendarCheckIcon, color: T.amber },
  { label: "Templates WA activos", value: "12", icon: MessageSquareIcon, color: T.teal },
];

// ── Etapa badge colors ────────────────────────────────────────────────
function etapaColor(etapa: string): { color: string; bg: string; border: string } {
  if (etapa === "MQL → SQL")     return { color: T.orange,  bg: "rgba(232,93,38,0.12)",    border: "rgba(232,93,38,0.22)" };
  if (etapa === "Lead → MQL")    return { color: T.blue,    bg: "rgba(74,144,217,0.12)",   border: "rgba(74,144,217,0.22)" };
  if (etapa === "SQL → Cliente") return { color: T.teal,    bg: "rgba(29,158,117,0.12)",   border: "rgba(29,158,117,0.22)" };
  if (etapa === "Retención")     return { color: T.purple,  bg: "rgba(127,119,221,0.12)",  border: "rgba(127,119,221,0.22)" };
  if (etapa === "Inactivo")      return { color: T.textMuted, bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" };
  if (etapa === "Fría → Tibia")  return { color: T.amber,   bg: "rgba(196,127,26,0.12)",   border: "rgba(196,127,26,0.22)" };
  return { color: T.textSecondary, bg: T.bgSubtle, border: T.borderDefault };
}

// ── Mini bar ─────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: 52, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
    </div>
  );
}

// ── Stat cell (number + bar) ──────────────────────────────────────────
function StatCell({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color, letterSpacing: "0.01em" }}>
        {value.toFixed(1)}%
      </span>
      <MiniBar value={value} max={max} color={color} />
    </div>
  );
}

// ── Delivery bar (WhatsApp) ───────────────────────────────────────────
function DeliveryBar({ tasa, color }: { tasa: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: SANS, fontSize: 11, color: T.textMuted }}>Tasa de entrega</span>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color }}>
          {tasa > 0 ? `${tasa}%` : "—"}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            width: `${tasa}%`,
            height: "100%",
            borderRadius: 3,
            background: tasa > 90 ? T.teal : tasa > 70 ? T.blue : tasa > 0 ? T.amber : "transparent",
          }}
        />
      </div>
    </div>
  );
}

// ── Conversion bar (landings) ─────────────────────────────────────────
function ConvBar({ value, best }: { value: number; best: number }) {
  const pct = (value / best) * 100;
  const isTop = value === best;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 72, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 3,
            background: isTop ? T.teal : T.blue,
            opacity: isTop ? 1 : 0.7,
          }}
        />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: isTop ? T.teal : T.textSecondary }}>
        {value}%
      </span>
    </div>
  );
}

// ── Row hover state helper ────────────────────────────────────────────
function useHover() {
  const [hovered, setHovered] = useState<number | null>(null);
  return {
    hovered,
    onMouseEnter: (i: number) => setHovered(i),
    onMouseLeave: () => setHovered(null),
  };
}

// ── Email Sequences Tab ───────────────────────────────────────────────
function EmailTab() {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();

  const totalContactos = EMAIL_SEQS.reduce((s, r) => s + r.contactos, 0);
  const avgApertura = (EMAIL_SEQS.reduce((s, r) => s + r.apertura, 0) / EMAIL_SEQS.length).toFixed(1);
  const avgClick = (EMAIL_SEQS.reduce((s, r) => s + r.click, 0) / EMAIL_SEQS.length).toFixed(1);
  const avgCitas = (EMAIL_SEQS.reduce((s, r) => s + r.citas, 0) / EMAIL_SEQS.length).toFixed(1);

  const COL = "220px 140px 130px 60px 100px 110px 110px 110px 90px";

  const headerCell = (label: string) => (
    <div
      key={label}
      style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 600,
        color: T.textMuted,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
      }}
    >
      {label}
    </div>
  );

  return (
    <div>
      <div
        style={{
          background: T.bgPanel,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.radiusLg,
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL,
            padding: "0 20px",
            height: 40,
            alignItems: "center",
            borderBottom: `1px solid ${T.borderFaint}`,
            background: T.bgSubtle,
          }}
        >
          {["Nombre", "Desarrollo", "Etapa", "Emails", "Contactos", "Apertura", "Click", "→ Cita", "Estado"].map(headerCell)}
        </div>

        {/* Data rows */}
        {EMAIL_SEQS.map((row, i) => {
          const et = etapaColor(row.etapa);
          const isHov = hovered === i;
          return (
            <div
              key={row.nombre}
              onMouseEnter={() => onMouseEnter(i)}
              onMouseLeave={onMouseLeave}
              style={{
                display: "grid",
                gridTemplateColumns: COL,
                padding: "0 20px",
                height: 56,
                alignItems: "center",
                borderBottom: i < EMAIL_SEQS.length - 1 ? `1px solid ${T.borderFaint}` : "none",
                background: isHov ? T.bgOverlay : "transparent",
                transition: "background 0.15s ease",
                cursor: "default",
              }}
            >
              {/* Nombre */}
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: 12,
                }}
              >
                {row.nombre}
              </div>

              {/* Desarrollo */}
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  color: T.textSecondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.desarrollo}
              </div>

              {/* Etapa badge */}
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 8px",
                    borderRadius: T.radiusSm,
                    background: et.bg,
                    border: `1px solid ${et.border}`,
                    color: et.color,
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.etapa}
                </span>
              </div>

              {/* Emails count */}
              <div style={{ fontFamily: MONO, fontSize: 13, color: T.textSecondary, textAlign: "center" }}>
                {row.emails}
              </div>

              {/* Contactos */}
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                {row.contactos.toLocaleString()}
              </div>

              {/* Apertura */}
              <StatCell value={row.apertura} max={55} color={T.teal} />

              {/* Click */}
              <StatCell value={row.click} max={25} color={T.blue} />

              {/* Cita */}
              <StatCell value={row.citas} max={20} color={T.orange} />

              {/* Estado */}
              <div>
                {row.estado === "activa" ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: T.radiusSm,
                      background: "rgba(29,158,117,0.10)",
                      border: `1px solid rgba(29,158,117,0.22)`,
                      color: T.teal,
                      fontFamily: SANS,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <PlayIcon size={9} />
                    Activa
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: T.radiusSm,
                      background: "rgba(196,127,26,0.10)",
                      border: `1px solid rgba(196,127,26,0.22)`,
                      color: T.amber,
                      fontFamily: SANS,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <PauseIcon size={9} />
                    Pausada
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Footer summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL,
            padding: "0 20px",
            height: 44,
            alignItems: "center",
            borderTop: `1px solid ${T.borderDefault}`,
            background: T.bgSubtle,
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
            {EMAIL_SEQS.length} secuencias
          </div>
          <div /><div /><div />
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.textPrimary }}>
            {totalContactos.toLocaleString()} total
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.teal }}>
            {avgApertura}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.blue }}>
            {avgClick}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.orange }}>
            {avgCitas}%
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp Tab ──────────────────────────────────────────────────────
function WhatsAppTab() {
  const approved = WA_TEMPLATES.filter(t => t.status === "aprobado");
  const pending  = WA_TEMPLATES.filter(t => t.status === "pendiente");
  const avgTasa  = approved.reduce((s, t) => s + t.tasa, 0) / approved.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Action bar */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "0 18px",
            height: 38,
            borderRadius: T.radiusMd,
            background: "rgba(29,158,117,0.12)",
            border: `1px solid rgba(29,158,117,0.28)`,
            color: T.teal,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <PlusIcon size={14} />
          Crear template
        </button>
      </div>

      {/* Templates grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {WA_TEMPLATES.map((t) => {
          const isPending = t.status === "pendiente";
          const tasaColor = t.tasa > 90 ? T.teal : t.tasa > 70 ? T.blue : T.amber;
          return (
            <div
              key={t.nombre}
              style={{
                background: T.bgPanel,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: T.radiusLg,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
                    {t.nombre}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* tipo badge */}
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: T.radiusSm,
                        background: t.tipo === "utility"
                          ? "rgba(74,144,217,0.10)"
                          : "rgba(127,119,221,0.10)",
                        border: `1px solid ${t.tipo === "utility"
                          ? "rgba(74,144,217,0.22)"
                          : "rgba(127,119,221,0.22)"}`,
                        color: t.tipo === "utility" ? T.blue : T.purple,
                        fontFamily: SANS,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "capitalize" as const,
                      }}
                    >
                      {t.tipo}
                    </span>
                    {/* status badge */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: T.radiusSm,
                        background: isPending
                          ? "rgba(196,127,26,0.10)"
                          : "rgba(29,158,117,0.10)",
                        border: `1px solid ${isPending
                          ? "rgba(196,127,26,0.22)"
                          : "rgba(29,158,117,0.22)"}`,
                        color: isPending ? T.amber : T.teal,
                        fontFamily: SANS,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {isPending ? <ClockIcon size={9} /> : <CheckCircleIcon size={9} />}
                      {isPending ? "Pendiente" : "Aprobado"}
                    </span>
                  </div>
                </div>

                {/* Big tasa number */}
                {!isPending && (
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 22,
                      fontWeight: 700,
                      color: tasaColor,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {t.tasa}%
                  </div>
                )}
              </div>

              {/* Delivery bar */}
              <DeliveryBar tasa={t.tasa} color={tasaColor} />
            </div>
          );
        })}
      </div>

      {/* Summary strip */}
      <div
        style={{
          display: "flex",
          gap: 32,
          padding: "14px 20px",
          background: T.bgSubtle,
          border: `1px solid ${T.borderFaint}`,
          borderRadius: T.radiusMd,
        }}
      >
        {[
          { label: "Aprobados", value: approved.length, color: T.teal },
          { label: "Pendientes", value: pending.length, color: T.amber },
          { label: "Entrega promedio", value: `${avgTasa.toFixed(1)}%`, color: T.blue },
        ].map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: SANS, fontSize: 11, color: T.textMuted }}>{s.label}</span>
            <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: s.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Landing Pages Tab ─────────────────────────────────────────────────
function LandingTab() {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const bestConv     = Math.max(...LANDINGS.map(l => l.conversión));
  const totalVisitas = LANDINGS.reduce((s, l) => s + l.visitas, 0);
  const totalLeads   = LANDINGS.reduce((s, l) => s + l.leads, 0);
  const bestCpl      = Math.min(...LANDINGS.map(l => l.cpl));
  const bestLanding  = LANDINGS.find(l => l.cpl === bestCpl);

  const COL = "220px 210px 90px 80px 160px 90px";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Table */}
      <div
        style={{
          background: T.bgPanel,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.radiusLg,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL,
            padding: "0 20px",
            height: 40,
            alignItems: "center",
            borderBottom: `1px solid ${T.borderFaint}`,
            background: T.bgSubtle,
          }}
        >
          {["Nombre", "URL", "Visitas", "Leads", "Conversión", "CPL"].map((label) => (
            <div
              key={label}
              style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 600,
                color: T.textMuted,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {LANDINGS.map((l, i) => {
          const isTop = l.conversión === bestConv;
          const isHov = hovered === i;
          return (
            <div
              key={l.nombre}
              onMouseEnter={() => onMouseEnter(i)}
              onMouseLeave={onMouseLeave}
              style={{
                display: "grid",
                gridTemplateColumns: COL,
                padding: "0 20px",
                height: 56,
                alignItems: "center",
                borderBottom: i < LANDINGS.length - 1 ? `1px solid ${T.borderFaint}` : "none",
                background: isHov ? T.bgOverlay : isTop ? "rgba(29,158,117,0.04)" : "transparent",
                transition: "background 0.15s ease",
                cursor: "default",
                borderLeft: isTop ? `3px solid ${T.teal}` : "3px solid transparent",
              }}
            >
              {/* Nombre */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isTop && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: T.teal,
                      flexShrink: 0,
                      display: "block",
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: isTop ? 700 : 600,
                    color: isTop ? T.textPrimary : T.textSecondary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.nombre}
                </span>
              </div>

              {/* URL */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  overflow: "hidden",
                  paddingRight: 8,
                }}
              >
                <GlobeIcon size={11} style={{ flexShrink: 0, opacity: 0.5, color: T.blue }} />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: T.blue,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.url}
                </span>
                <ExternalLinkIcon size={10} style={{ flexShrink: 0, opacity: 0.4, color: T.blue }} />
              </div>

              {/* Visitas */}
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                {l.visitas.toLocaleString()}
              </div>

              {/* Leads */}
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: T.purple }}>
                {l.leads.toLocaleString()}
              </div>

              {/* Conversión bar */}
              <ConvBar value={l.conversión} best={bestConv} />

              {/* CPL */}
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 600,
                  color: l.cpl <= 150 ? T.teal : l.cpl <= 170 ? T.blue : T.amber,
                }}
              >
                ${l.cpl}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL,
            padding: "0 20px",
            height: 44,
            alignItems: "center",
            borderTop: `1px solid ${T.borderDefault}`,
            background: T.bgSubtle,
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
            {LANDINGS.length} landings
          </div>
          <div />
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.textPrimary }}>
            {totalVisitas.toLocaleString()}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.purple }}>
            {totalLeads.toLocaleString()}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.teal }}>
            {((totalLeads / totalVisitas) * 100).toFixed(1)}% prom.
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: T.amber }}>
            ${Math.round(LANDINGS.reduce((s, l) => s + l.cpl, 0) / LANDINGS.length)} prom.
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          {
            label: "Total visitas",
            value: totalVisitas.toLocaleString(),
            sub: "todas las landings",
            color: T.blue,
            icon: BarChart2Icon,
          },
          {
            label: "Total leads generados",
            value: totalLeads.toLocaleString(),
            sub: "este periodo",
            color: T.purple,
            icon: UsersIcon,
          },
          {
            label: "Mejor CPL",
            value: `$${bestCpl}`,
            sub: bestLanding ? bestLanding.nombre : "",
            color: T.teal,
            icon: TrendingUpIcon,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                background: T.bgPanel,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: T.radiusLg,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: T.radiusMd,
                  background: `${card.color}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} color={card.color} />
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: T.textMuted, marginBottom: 2 }}>
                  {card.label}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 20,
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: T.textGhost, marginTop: 3 }}>
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ElementType; count: number }[] = [
  { id: "email",    label: "Secuencias de email", icon: MailIcon,          count: EMAIL_SEQS.length },
  { id: "whatsapp", label: "WhatsApp",            icon: MessageSquareIcon, count: WA_TEMPLATES.length },
  { id: "landing",  label: "Landing Pages",       icon: GlobeIcon,         count: LANDINGS.length },
];

// ── Page ──────────────────────────────────────────────────────────────
export default function ConversionPage() {
  const [activeTab, setActiveTab] = useState<TabId>("email");

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
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: T.textPrimary,
              letterSpacing: "-0.02em",
              fontFamily: SANS,
            }}
          >
            Conversión
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: T.textSecondary, fontFamily: SANS }}>
            Email · WhatsApp · Landing Pages · HubSpot
          </p>
        </div>

        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "0 20px",
            height: 40,
            borderRadius: T.radiusMd,
            background: "linear-gradient(135deg, #E85D26, #c44d1a)",
            border: "none",
            color: "white",
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(232,93,38,0.32)",
          }}
        >
          <PlusIcon size={14} />
          Nueva secuencia
        </button>
      </div>

      {/* ── KPI Bar ────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 10,
        }}
      >
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              style={{
                background: T.bgPanel,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: T.radiusLg,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: T.radiusSm,
                    background: `${kpi.color}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={13} color={kpi.color} />
                </div>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    color: T.textMuted,
                    lineHeight: 1.3,
                  }}
                >
                  {kpi.label}
                </span>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  fontWeight: 700,
                  color: kpi.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          background: T.bgSubtle,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.radiusMd,
          padding: 4,
          alignSelf: "flex-start",
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
                padding: "0 18px",
                height: 36,
                borderRadius: 7,
                background: isActive ? T.bgOverlay : "transparent",
                border: isActive ? `1px solid ${T.borderEmphasis}` : "1px solid transparent",
                color: isActive ? T.textPrimary : T.textSecondary,
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
              {tab.label}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: isActive ? `${T.orange}20` : "rgba(255,255,255,0.06)",
                  color: isActive ? T.orange : T.textMuted,
                  lineHeight: "16px",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      {activeTab === "email"    && <EmailTab />}
      {activeTab === "whatsapp" && <WhatsAppTab />}
      {activeTab === "landing"  && <LandingTab />}
    </div>
  );
}
