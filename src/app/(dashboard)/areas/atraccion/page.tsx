"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, Tooltip as RTooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpIcon, ArrowDownIcon, SearchIcon, ExternalLinkIcon,
  TrendingUpIcon, UsersIcon, MousePointerClickIcon, BarChart3Icon,
} from "lucide-react";
import { T } from "@/styles/tokens";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';
const n = (v: number) => v.toLocaleString("es-MX");

// ── Demo data ──────────────────────────────────────────────────────────────────

const TRAFFIC_DATA = [
  { mes: "Dic", organico: 2840, pagado: 1920, directo: 820, referral: 510 },
  { mes: "Ene", organico: 3120, pagado: 2140, directo: 890, referral: 540 },
  { mes: "Feb", organico: 3540, pagado: 2380, directo: 940, referral: 610 },
  { mes: "Mar", organico: 3890, pagado: 2520, directo: 1020, referral: 670 },
  { mes: "Abr", organico: 4210, pagado: 2680, directo: 1120, referral: 780 },
  { mes: "May", organico: 4521, pagado: 2847, directo: 1203, referral: 892 },
];

const KEYWORDS = [
  { keyword: "departamentos en tulum", pos: 3, cambio: 2, volumen: 8900, url: "/aukena", ctr: 12.4 },
  { keyword: "casas en cancún con alberca", pos: 5, cambio: 1, volumen: 5400, url: "/turquesa", ctr: 8.7 },
  { keyword: "preventa tulum 2026", pos: 4, cambio: 5, volumen: 2100, url: "/aukena", ctr: 11.2 },
  { keyword: "departamentos playa del carmen 2026", pos: 7, cambio: -1, volumen: 4200, url: "/turquesa", ctr: 6.3 },
  { keyword: "casas en mérida norte", pos: 8, cambio: 0, volumen: 3800, url: "/meriden", ctr: 5.9 },
  { keyword: "residencial en querétaro", pos: 11, cambio: 3, volumen: 3200, url: "/bonza", ctr: 4.1 },
  { keyword: "nexus suite desarrollos", pos: 1, cambio: 0, volumen: 1800, url: "/", ctr: 24.7 },
  { keyword: "departamentos en cuautlancingo puebla", pos: 12, cambio: -2, volumen: 2800, url: "/trojes", ctr: 3.8 },
  { keyword: "casas en hidalgo tizayuca", pos: 14, cambio: 1, volumen: 2400, url: "/abeto", ctr: 3.2 },
  { keyword: "fraccionamiento estado de mexico", pos: 16, cambio: 0, volumen: 6700, url: "/solares", ctr: 2.9 },
];

const PORTALES = [
  { portal: "Inmuebles24", leads: 347, cpl: 142, vistas: 28400, conversion: 1.22, color: "#FF5722" },
  { portal: "Metros Cúbicos", leads: 189, cpl: 198, vistas: 15600, conversion: 1.21, color: "#2196F3" },
  { portal: "Lamudi", leads: 134, cpl: 224, vistas: 12300, conversion: 1.09, color: "#4CAF50" },
  { portal: "Vivanuncios", leads: 87, cpl: 267, vistas: 8900, conversion: 0.98, color: "#9C27B0" },
  { portal: "MercadoLibre Inmuebles", leads: 64, cpl: 312, vistas: 7200, conversion: 0.89, color: "#FFD600" },
];

const LEAD_MAGNETS = [
  { nombre: "Guía Aukena: Invertir en Tulum", descargas: 487, leads: 134, tasa: 27.5 },
  { nombre: "Calculadora Capacidad de Compra", descargas: 1243, leads: 312, tasa: 25.1 },
  { nombre: "Checklist: Tu primera vivienda", descargas: 892, leads: 187, tasa: 21.0 },
];

const KPIS = [
  { label: "Tráfico orgánico/mes", value: "4,521", icon: TrendingUpIcon, color: T.teal },
  { label: "Posición prom. Google", value: "8.4", icon: BarChart3Icon, color: T.orange },
  { label: "Keywords top 10", value: "23", icon: SearchIcon, color: T.purple },
  { label: "Leads orgánicos/mes", value: "312", icon: UsersIcon, color: T.blue },
  { label: "CTR promedio", value: "4.2%", icon: MousePointerClickIcon, color: T.amber },
  { label: "Impresiones/mes", value: "107,600", icon: ExternalLinkIcon, color: T.textSecondary },
];

const CHANNEL_COLORS: Record<string, string> = {
  organico: T.teal,
  pagado: T.orange,
  directo: T.purple,
  referral: T.blue,
};
const CHANNEL_LABELS: Record<string, string> = {
  organico: "Orgánico",
  pagado: "Pagado",
  directo: "Directo",
  referral: "Referral",
};

// ── Panel wrapper ──────────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.bgPanel,
      border: `0.5px solid ${T.borderDefault}`,
      borderRadius: T.radiusLg,
      padding: "20px 22px",
      fontFamily: SANS,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

function TrafficTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div style={{ background: "rgba(12,12,14,0.96)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", minWidth: 160, fontFamily: SANS }}>
      <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      {[...payload].reverse().map(p => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: p.color }}>
            {CHANNEL_LABELS[p.dataKey] ?? p.dataKey}
          </span>
          <span style={{ fontSize: 11, fontFamily: MONO, color: T.textPrimary }}>{n(p.value)}</span>
        </div>
      ))}
      <div style={{ borderTop: `0.5px solid ${T.borderFaint}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: T.textGhost }}>Total</span>
        <span style={{ fontSize: 12, fontFamily: MONO, color: T.textPrimary, fontWeight: 600 }}>{n(total)}</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AtraccionPage() {
  const [kwSearch, setKwSearch] = useState("");

  const filteredKw = kwSearch.trim()
    ? KEYWORDS.filter(k => k.keyword.toLowerCase().includes(kwSearch.trim().toLowerCase()))
    : KEYWORDS;

  const maxPortalLeads = Math.max(...PORTALES.map(p => p.leads));

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: SANS }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, color: T.textPrimary, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: SANS }}>Atracción</h1>
          <p style={{ margin: "4px 0 0", color: T.textSecondary, fontSize: 13, fontFamily: SANS }}>SEO · Portales inmobiliarios · Lead magnets · Tráfico orgánico</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["7D", "30D", "90D", "Todo"].map(p => (
            <button key={p} style={{ height: 30, padding: "0 12px", background: p === "30D" ? T.orange : "transparent", border: `1px solid ${p === "30D" ? "transparent" : T.borderDefault}`, borderRadius: 20, color: p === "30D" ? "#fff" : T.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI bar */}
      <Panel style={{ padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }}>
          {KPIS.map((k, i) => {
            const Icon = k.icon;
            return (
              <React.Fragment key={k.label}>
                {i > 0 && <div style={{ width: "0.5px", background: T.borderFaint, gridColumn: "unset" }} />}
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon size={12} color={k.color} />
                    <span style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</span>
                  </div>
                  <span style={{ fontSize: 20, fontFamily: MONO, color: k.color, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{k.value}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Panel>

      {/* Traffic chart + channel legend */}
      <Panel>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary }}>Tráfico por canal</span>
          <div style={{ display: "flex", gap: 14 }}>
            {Object.entries(CHANNEL_COLORS).map(([key, color]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 11, color: T.textMuted, fontFamily: SANS }}>{CHANNEL_LABELS[key]}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={TRAFFIC_DATA} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {Object.entries(CHANNEL_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="mes" axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} tick={{ fill: T.textGhost, fontSize: 10, fontFamily: SANS }} />
            <RTooltip content={TrafficTooltip as any} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
            {Object.entries(CHANNEL_COLORS).map(([key, color]) => (
              <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} fill={`url(#grad-${key})`} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      {/* Keywords + Portals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>

        {/* Keywords */}
        <Panel style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `0.5px solid ${T.borderFaint}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary }}>Keywords principales</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusMd, padding: "5px 10px" }}>
              <SearchIcon size={11} color={T.textGhost} />
              <input value={kwSearch} onChange={e => setKwSearch(e.target.value)} placeholder="Filtrar..." style={{ background: "none", border: "none", outline: "none", color: T.textPrimary, fontSize: 11, fontFamily: SANS, width: 100 }} />
            </div>
          </div>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 64px 72px 52px", gap: 8, padding: "8px 20px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
            {["Keyword", "Pos.", "Cambio", "Vol/mes", "CTR"].map(h => (
              <span key={h} style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO, textAlign: h === "Keyword" ? "left" : "right" }}>{h}</span>
            ))}
          </div>
          {filteredKw.map((kw, i) => {
            const isTop = kw.pos <= 10;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 52px 64px 72px 52px", gap: 8, padding: "9px 20px", borderBottom: i < filteredKw.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={kw.keyword}>{kw.keyword}</span>
                <span style={{ fontSize: 12, fontFamily: MONO, color: isTop ? T.teal : T.textMuted, textAlign: "right", fontWeight: isTop ? 600 : 400 }}>{kw.pos}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                  {kw.cambio > 0 && <ArrowUpIcon size={10} color={T.teal} />}
                  {kw.cambio < 0 && <ArrowDownIcon size={10} color={T.red} />}
                  <span style={{ fontSize: 11, fontFamily: MONO, color: kw.cambio > 0 ? T.teal : kw.cambio < 0 ? T.red : T.textGhost }}>
                    {kw.cambio === 0 ? "—" : Math.abs(kw.cambio)}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontFamily: MONO, color: T.textMuted, textAlign: "right" }}>{n(kw.volumen)}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: kw.ctr >= 10 ? T.orange : T.textMuted, textAlign: "right" }}>{kw.ctr}%</span>
              </div>
            );
          })}
        </Panel>

        {/* Portals */}
        <Panel style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary }}>Portales inmobiliarios</span>
          </div>
          {PORTALES.map((p, i) => (
            <div key={p.portal} style={{ padding: "14px 20px", borderBottom: i < PORTALES.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", borderLeft: `3px solid ${p.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: T.textPrimary, fontFamily: SANS, fontWeight: 500 }}>{p.portal}</span>
                <span style={{ fontSize: 12, fontFamily: MONO, color: T.textSecondary }}>{n(p.leads)} leads</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: T.textGhost }}>${n(p.cpl)} CPL · {n(p.vistas)} vistas</span>
                <span style={{ fontSize: 10, fontFamily: MONO, color: T.textMuted }}>{p.conversion}% conv.</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(p.leads / maxPortalLeads) * 100}%`, background: p.color, borderRadius: 2, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </Panel>
      </div>

      {/* Lead magnets */}
      <Panel>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 16 }}>Lead magnets</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {LEAD_MAGNETS.map(lm => (
            <div key={lm.nombre} style={{ background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusMd, padding: "16px 18px" }}>
              <div style={{ fontSize: 13, color: T.textPrimary, fontFamily: SANS, fontWeight: 500, marginBottom: 12, lineHeight: 1.4 }}>{lm.nombre}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { l: "Descargas", v: n(lm.descargas), c: T.textMuted },
                  { l: "Leads", v: n(lm.leads), c: T.blue },
                  { l: "Tasa conv.", v: `${lm.tasa}%`, c: T.teal },
                ].map(m => (
                  <div key={m.l}>
                    <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{m.l}</div>
                    <div style={{ fontSize: 14, fontFamily: MONO, color: m.c, fontWeight: 600 }}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${lm.tasa * 3}%`, background: T.teal, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
