"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DESARROLLOS } from "@/lib/data/desarrollos";
import {
  SparklesIcon,
  UserPlusIcon,
  RefreshCwIcon,
  Share2Icon,
  BarChart3Icon,
  ZapIcon,
  PlusIcon,
  DatabaseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  MinusIcon,
} from "lucide-react";
import { T } from "@/styles/tokens";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Demo data ─────────────────────────────────────────────────────────────────

const SUMMARY_KPIS = [
  { label: "Contactos totales", value: "8,347", delta: "+12.4%", color: T.purple, positive: true },
  { label: "Leads este mes", value: "934", delta: "+8.7%", color: T.teal, positive: true },
  { label: "CPL promedio", value: "$157", delta: "-4.2%", color: T.orange, positive: true },
  { label: "Piezas generadas", value: "127", delta: "+34%", color: T.blue, positive: true },
  { label: "Campañas activas", value: "6", delta: "0", color: T.amber, positive: null },
  { label: "Posts esta semana", value: "8", delta: "+2", color: T.textSecondary, positive: true },
];

const ACTIVIDAD = [
  { tipo: "copy", Icon: SparklesIcon, texto: "Post generado para Aukena · Campaña Caribe Q2", tiempo: "hace 12 min", color: T.orange },
  { tipo: "lead", Icon: UserPlusIcon, texto: "347 leads nuevos esta semana desde Meta Ads", tiempo: "hace 1h", color: T.teal },
  { tipo: "sync", Icon: RefreshCwIcon, texto: "Sync HubSpot completado · 8,347 contactos", tiempo: "hace 3h", color: T.purple },
  { tipo: "post", Icon: Share2Icon, texto: "Post programado para Turquesa · jueves 10am", tiempo: "hace 5h", color: T.blue },
  { tipo: "copy", Icon: SparklesIcon, texto: "Email nurturing generado para secuencia Bonza", tiempo: "ayer", color: T.orange },
  { tipo: "lead", Icon: UserPlusIcon, texto: "189 leads desde Inmuebles24 este mes", tiempo: "ayer", color: T.teal },
];

const TOP_DESARROLLOS = [
  { nombre: "Aukena", leads: 287, delta: "+18%", color: "#0EA5E9" },
  { nombre: "Turquesa", leads: 198, delta: "+12%", color: "#06B6D4" },
  { nombre: "Bonza", leads: 156, delta: "+7%", color: "#8B5CF6" },
  { nombre: "Meriden", leads: 142, delta: "+15%", color: "#10B981" },
  { nombre: "Central Park", leads: 89, delta: "+4%", color: "#EC4899" },
];

const MAX_LEADS = TOP_DESARROLLOS[0].leads;

const QUICK_ACTIONS = [
  { Icon: ZapIcon, label: "Generar copy", desc: "Post, blog, email o ad", color: T.orange, route: "/areas/contenido" },
  { Icon: BarChart3Icon, label: "Ver analytics", desc: "HubSpot · Meta · TikTok", color: T.blue, route: "/areas/analytics" },
  { Icon: PlusIcon, label: "Nueva campaña", desc: "Parrilla y calendario", color: T.teal, route: "/areas/social-media" },
  { Icon: DatabaseIcon, label: "Sincronizar HubSpot", desc: "8,347 contactos", color: T.purple, route: "/areas/analytics" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, delta, color, positive }: typeof SUMMARY_KPIS[0]) {
  const [hovered, setHovered] = useState(false);
  const isNeutral = positive === null;
  const deltaColor = isNeutral ? T.amber : positive ? T.teal : T.red;
  const DeltaIcon = isNeutral ? MinusIcon : positive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.bgSubtle : T.bgPanel,
        border: `1px solid ${hovered ? color + "30" : T.borderDefault}`,
        borderRadius: T.radiusLg,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: "default",
        transition: "background 150ms, border-color 150ms",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* accent top strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: hovered ? 1 : 0.35,
        transition: "opacity 150ms",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: SANS }}>
          {label}
        </span>
        <div style={{
          display: "flex", alignItems: "center", gap: 3,
          background: deltaColor + "15", borderRadius: 6, padding: "2px 7px",
        }}>
          <DeltaIcon size={10} color={deltaColor} />
          <span style={{ color: deltaColor, fontSize: 11, fontWeight: 600, fontFamily: MONO }}>
            {delta}
          </span>
        </div>
      </div>

      <div style={{ color: T.textPrimary, fontSize: 30, fontWeight: 700, fontFamily: MONO, letterSpacing: "-0.04em", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

function ActivityItem({ item, last }: { item: typeof ACTIVIDAD[0]; last: boolean }) {
  const { Icon, texto, tiempo, color } = item;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "14px 0",
      borderBottom: last ? "none" : `1px solid ${T.borderFaint}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: T.radiusMd,
        background: color + "15",
        display: "grid", placeItems: "center", flexShrink: 0,
        marginTop: 1,
      }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: T.textPrimary, fontSize: 13, lineHeight: 1.4, fontFamily: SANS }}>{texto}</div>
        <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4, fontFamily: MONO }}>{tiempo}</div>
      </div>
    </div>
  );
}

function TopDesarrolloRow({ d, i }: { d: typeof TOP_DESARROLLOS[0]; i: number }) {
  const pct = Math.round((d.leads / MAX_LEADS) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", borderBottom: i < TOP_DESARROLLOS.length - 1 ? `1px solid ${T.borderFaint}` : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.textMuted, fontSize: 11, fontFamily: MONO, width: 16 }}>#{i + 1}</span>
          <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 600, fontFamily: SANS }}>{d.nombre}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.teal, fontSize: 11, fontFamily: MONO }}>{d.delta}</span>
          <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: MONO }}>{d.leads}</span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: T.borderFaint, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: d.color,
          borderRadius: 99,
          transition: "width 600ms cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
}

function QuickActionCard({ action }: { action: typeof QUICK_ACTIONS[0] }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { Icon, label, desc, color, route } = action;

  return (
    <button
      onClick={() => router.push(route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? color + "12" : T.bgPanel,
        border: `1px solid ${hovered ? color + "40" : T.borderDefault}`,
        borderRadius: T.radiusLg,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 150ms, border-color 150ms",
        fontFamily: SANS,
        width: "100%",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: T.radiusMd,
        background: hovered ? color + "25" : color + "18",
        display: "grid", placeItems: "center", flexShrink: 0,
        transition: "background 150ms",
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ color: T.textMuted, fontSize: 12 }}>{desc}</div>
      </div>
      <ArrowRightIcon size={16} color={hovered ? color : T.textGhost} style={{ flexShrink: 0, transition: "color 150ms" }} />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Buenos días");
  const [dateStr, setDateStr] = useState("");

  const completos = DESARROLLOS.filter(
    (d) => d.ficha && d.storytelling && d.competencia && d.audiencias
  ).length;

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches");
    setDateStr(new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  return (
    <div style={{ padding: "40px 40px 60px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40, fontFamily: SANS }}>

      {/* ── Hero ── */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ margin: 0, color: T.textMuted, fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: MONO }}>
            {greeting}
          </p>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", color: T.textPrimary, lineHeight: 1.1 }}>
            <span style={{ color: T.orange }}>HU</span> Marketing Suite
          </h1>
          <p style={{ margin: "6px 0 0", color: T.textSecondary, fontSize: 14 }}>
            {DESARROLLOS.length} desarrollos activos
            <span style={{ color: T.borderEmphasis, margin: "0 8px" }}>·</span>
            {completos} con documentación completa
            <span style={{ color: T.borderEmphasis, margin: "0 8px" }}>·</span>
            <span style={{ color: T.teal }}>{DESARROLLOS.length - completos} pendientes</span>
          </p>
        </div>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
          padding: "12px 18px",
          background: T.bgPanel,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.radiusMd,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, boxShadow: `0 0 8px ${T.teal}` }} />
            <span style={{ color: T.teal, fontSize: 11, fontWeight: 600, fontFamily: MONO }}>Sistema activo</span>
          </div>
          <span style={{ color: T.textMuted, fontSize: 11, fontFamily: MONO }}>{dateStr}</span>
        </div>
      </section>

      {/* ── KPI Grid ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ margin: 0, color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Resumen ejecutivo
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {SUMMARY_KPIS.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      {/* ── Two column section ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>

        {/* Left: Actividad reciente */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Actividad reciente
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange, boxShadow: `0 0 6px ${T.orange}`, animation: "streamPulse 1.4s ease-in-out infinite" }} />
              <span style={{ color: T.orange, fontSize: 10, fontWeight: 600, fontFamily: MONO, letterSpacing: "0.06em" }}>EN VIVO</span>
            </div>
          </div>
          <div style={{
            background: T.bgPanel,
            border: `1px solid ${T.borderDefault}`,
            borderRadius: T.radiusLg,
            padding: "8px 20px",
          }}>
            {ACTIVIDAD.map((item, i) => (
              <ActivityItem key={i} item={item} last={i === ACTIVIDAD.length - 1} />
            ))}
          </div>
        </section>

        {/* Right: Top desarrollos */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Top desarrollos
            </h2>
            <span style={{ color: T.textMuted, fontSize: 11, fontFamily: MONO }}>este mes</span>
          </div>
          <div style={{
            background: T.bgPanel,
            border: `1px solid ${T.borderDefault}`,
            borderRadius: T.radiusLg,
            padding: "8px 20px",
            flex: 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 10px", borderBottom: `1px solid ${T.borderFaint}`, marginBottom: 4 }}>
              <span style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Desarrollo</span>
              <span style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Leads</span>
            </div>
            {TOP_DESARROLLOS.map((d, i) => (
              <TopDesarrolloRow key={d.nombre} d={d} i={i} />
            ))}
          </div>

          {/* Mini stat */}
          <div style={{
            background: T.tealBg,
            border: `1px solid ${T.teal}25`,
            borderRadius: T.radiusMd,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <TrendingUpIcon size={16} color={T.teal} />
            <div>
              <div style={{ color: T.textPrimary, fontSize: 12, fontWeight: 600 }}>934 leads este mes</div>
              <div style={{ color: T.textMuted, fontSize: 11, marginTop: 1 }}>+8.7% vs mes anterior</div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Quick actions ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ margin: 0, color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Acciones rápidas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.label} action={action} />
          ))}
        </div>
      </section>
    </div>
  );
}
