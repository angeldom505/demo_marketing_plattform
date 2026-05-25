"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from "recharts";
import {
  GlobeIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon,
  CheckCircleIcon, AlertCircleIcon, XCircleIcon,
  TrendingUpIcon, LinkIcon, SearchIcon, FileTextIcon,
  ZapIcon, ShieldCheckIcon,
} from "lucide-react";
import { T } from "@/styles/tokens";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';
const n = (v: number) => v.toLocaleString("es-MX");

// ── Demo data ──────────────────────────────────────────────────────────────────

const ORGANIC_TREND = [
  { mes: "Nov", visitas: 3120, clicks: 4280, impresiones: 87400 },
  { mes: "Dic", visitas: 3380, clicks: 4610, impresiones: 91200 },
  { mes: "Ene", visitas: 3640, clicks: 5020, impresiones: 96800 },
  { mes: "Feb", visitas: 3890, clicks: 5340, impresiones: 101500 },
  { mes: "Mar", visitas: 4210, clicks: 5780, impresiones: 104300 },
  { mes: "Abr", visitas: 4380, clicks: 6120, impresiones: 106900 },
  { mes: "May", visitas: 4521, clicks: 6340, impresiones: 107600 },
];

const TOP_PAGES = [
  { url: "/aukena", titulo: "AUKENA Residences — Preventa Tulum 2026", visitas: 1284, pos: 3.2, ctr: 12.4, cambio: 340 },
  { url: "/turquesa", titulo: "Nuevo Residencial Turquesa — Cancún", visitas: 876, pos: 5.8, ctr: 8.7, cambio: 120 },
  { url: "/calculadora-credito", titulo: "Calculadora de Capacidad de Compra", visitas: 743, pos: 6.1, ctr: 14.2, cambio: 210 },
  { url: "/blog/invertir-tulum", titulo: "¿Vale la pena invertir en Tulum en 2026?", visitas: 621, pos: 4.4, ctr: 9.8, cambio: 187 },
  { url: "/bonza", titulo: "Bonza — Residencial Querétaro", visitas: 498, pos: 8.3, ctr: 6.2, cambio: -34 },
  { url: "/meriden", titulo: "Meriden Cabo Norte — Mérida", visitas: 412, pos: 9.1, ctr: 5.4, cambio: 67 },
  { url: "/blog/primera-vivienda", titulo: "Checklist para comprar tu primera vivienda", visitas: 387, pos: 7.6, ctr: 7.1, cambio: 95 },
];

const KEYWORDS_CLUSTERS = [
  {
    cluster: "Tulum / Quintana Roo",
    color: T.orange,
    desarrollo: "AUKENA",
    keywords: [
      { kw: "departamentos en tulum", pos: 3, vol: 8900, intent: "Comercial" },
      { kw: "preventa tulum 2026", pos: 4, vol: 2100, intent: "Comercial" },
      { kw: "invertir en tulum", pos: 7, vol: 5400, intent: "Informacional" },
      { kw: "departamentos playa del carmen", pos: 6, vol: 4200, intent: "Comercial" },
    ],
  },
  {
    cluster: "Cancún / Caribe",
    color: T.blue,
    desarrollo: "TURQUESA",
    keywords: [
      { kw: "casas en cancún con alberca", pos: 5, vol: 5400, intent: "Comercial" },
      { kw: "residencial cancún norte", pos: 9, vol: 3200, intent: "Comercial" },
      { kw: "desarrollos nuevos cancún", pos: 11, vol: 2800, intent: "Comercial" },
    ],
  },
  {
    cluster: "Querétaro / Bajío",
    color: T.teal,
    desarrollo: "BONZA",
    keywords: [
      { kw: "residencial en querétaro", pos: 11, vol: 3200, intent: "Comercial" },
      { kw: "casas nuevas querétaro sur", pos: 14, vol: 2100, intent: "Comercial" },
      { kw: "fraccionamiento querétaro 2026", pos: 16, vol: 1800, intent: "Comercial" },
    ],
  },
  {
    cluster: "Mérida / Yucatán",
    color: T.purple,
    desarrollo: "MERIDEN",
    keywords: [
      { kw: "casas en mérida norte", pos: 8, vol: 3800, intent: "Comercial" },
      { kw: "residencial cabo norte mérida", pos: 6, vol: 1400, intent: "Comercial" },
      { kw: "desarrollos mérida yucatán", pos: 13, vol: 2600, intent: "Comercial" },
    ],
  },
];

const CWV_PAGES = [
  { page: "aukena", lcp: 1.8, cls: 0.04, inp: 87, score: 94 },
  { page: "turquesa", lcp: 2.1, cls: 0.08, inp: 112, score: 88 },
  { page: "calculadora-credito", lcp: 1.4, cls: 0.02, inp: 64, score: 97 },
  { page: "bonza", lcp: 2.6, cls: 0.12, inp: 148, score: 74 },
  { page: "meriden", lcp: 2.3, cls: 0.06, inp: 102, score: 84 },
  { page: "blog/invertir-tulum", lcp: 1.9, cls: 0.03, inp: 78, score: 92 },
];

const BACKLINKS = [
  { dominio: "arquitecturamx.com", da: 52, links: 14, tipo: "Editorial", estado: "activo" },
  { dominio: "inmobiliariamex.com.mx", da: 61, links: 8, tipo: "Directorio", estado: "activo" },
  { dominio: "revistaconstruir.mx", da: 48, links: 3, tipo: "Editorial", estado: "activo" },
  { dominio: "portalmexprop.com", da: 39, links: 22, tipo: "Portal", estado: "activo" },
  { dominio: "bienesvideo.mx", da: 28, links: 6, tipo: "Blog", estado: "perdido" },
  { dominio: "noticiasqroo.com", da: 44, links: 2, tipo: "Noticiero", estado: "activo" },
  { dominio: "realestatemexico.com", da: 67, links: 1, tipo: "Editorial", estado: "activo" },
];

const RANK_HISTORY = [
  { sem: "S1 Mar", aukena: 6, turquesa: 8, bonza: 14 },
  { sem: "S2 Mar", aukena: 5, turquesa: 8, bonza: 13 },
  { sem: "S3 Mar", aukena: 5, turquesa: 7, bonza: 12 },
  { sem: "S4 Mar", aukena: 4, turquesa: 7, bonza: 11 },
  { sem: "S1 Abr", aukena: 4, turquesa: 6, bonza: 13 },
  { sem: "S2 Abr", aukena: 3, turquesa: 6, bonza: 12 },
  { sem: "S3 Abr", aukena: 3, turquesa: 5, bonza: 11 },
  { sem: "S4 Abr", aukena: 3, turquesa: 5, bonza: 11 },
  { sem: "S1 May", aukena: 3, turquesa: 5, bonza: 12 },
  { sem: "S2 May", aukena: 3, turquesa: 5, bonza: 11 },
];

const TABS = ["Rendimiento", "Keywords & Clusters", "Técnico", "Backlinks"] as const;
type Tab = typeof TABS[number];

// ── Helpers ────────────────────────────────────────────────────────────────────

function cwvColor(metric: "lcp" | "cls" | "inp", val: number): string {
  if (metric === "lcp") return val <= 2.5 ? T.teal : val <= 4.0 ? T.amber : T.red;
  if (metric === "cls") return val <= 0.1 ? T.teal : val <= 0.25 ? T.amber : T.red;
  return val <= 200 ? T.teal : val <= 500 ? T.amber : T.red;
}

function scoreColor(s: number) {
  return s >= 90 ? T.teal : s >= 50 ? T.amber : T.red;
}

function ScoreRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = scoreColor(score);
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx={22} cy={22} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={4} fill="none" />
      <circle
        cx={22} cy={22} r={r}
        stroke={color} strokeWidth={4} fill="none"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
      <text x={22} y={26} textAnchor="middle" fill={color} fontSize={11} fontWeight={700} fontFamily={MONO}>{score}</text>
    </svg>
  );
}

function CwvBadge({ val, label, metric }: { val: number; label: string; metric: "lcp" | "cls" | "inp" }) {
  const color = cwvColor(metric, val);
  const Icon = color === T.teal ? CheckCircleIcon : color === T.amber ? AlertCircleIcon : XCircleIcon;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <Icon size={12} color={color} />
      <span style={{ fontSize: 13, fontFamily: MONO, color, fontWeight: 700 }}>
        {metric === "inp" ? `${val}ms` : val}
      </span>
      <span style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.bgPanel, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusLg, fontFamily: SANS, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textSecondary, marginBottom: 14 }}>
      {children}
    </div>
  );
}

// ── Tab: Rendimiento ───────────────────────────────────────────────────────────

function RendimientoTab() {
  const [metric, setMetric] = useState<"visitas" | "clicks" | "impresiones">("visitas");
  const METRIC_COLORS = { visitas: T.teal, clicks: T.orange, impresiones: T.purple };
  const METRIC_LABELS = { visitas: "Visitas orgánicas", clicks: "Clicks", impresiones: "Impresiones" };

  const tooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload.find((x: any) => x.dataKey === metric) ?? payload[0];
    return (
      <div style={{ background: "rgba(12,12,14,0.96)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontFamily: SANS }}>
        <div style={{ fontSize: 10, color: T.textGhost, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 14, fontFamily: MONO, color: METRIC_COLORS[metric], fontWeight: 700 }}>{n(p.value)}</div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{METRIC_LABELS[metric]}</div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Traffic chart */}
      <Panel style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SectionTitle>Tráfico orgánico — 7 meses</SectionTitle>
          <div style={{ display: "flex", gap: 6 }}>
            {(["visitas", "clicks", "impresiones"] as const).map(m => (
              <button key={m} onClick={() => setMetric(m)} style={{ height: 26, padding: "0 11px", background: metric === m ? METRIC_COLORS[m] : "transparent", border: `0.5px solid ${metric === m ? "transparent" : T.borderDefault}`, borderRadius: 20, color: metric === m ? "#fff" : T.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: SANS, textTransform: "capitalize" }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={ORGANIC_TREND} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="seo-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={METRIC_COLORS[metric]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={METRIC_COLORS[metric]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} tick={{ fill: T.textGhost, fontSize: 10, fontFamily: SANS }} />
            <RTooltip content={tooltip} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
            <Area type="monotone" dataKey={metric} stroke={METRIC_COLORS[metric]} strokeWidth={2} fill="url(#seo-grad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      {/* Top pages */}
      <Panel style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
          <SectionTitle>Páginas con mayor tráfico orgánico</SectionTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 90px 80px 70px 90px", gap: 8, padding: "8px 20px", borderBottom: `0.5px solid ${T.borderFaint}`, background: T.bgSubtle }}>
          {["Página", "Visitas/mes", "Pos. media", "CTR", "Δ vs mes ant."].map((h, i) => (
            <span key={h} style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO, textAlign: i === 0 ? "left" : "right" }}>{h}</span>
          ))}
        </div>
        {TOP_PAGES.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 90px 80px 70px 90px", gap: 8, padding: "10px 20px", borderBottom: i < TOP_PAGES.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: T.textPrimary, fontFamily: SANS, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.titulo}</div>
              <div style={{ fontSize: 10, fontFamily: MONO, color: T.textGhost }}>{p.url}</div>
            </div>
            <span style={{ fontSize: 12, fontFamily: MONO, color: T.textMuted, textAlign: "right" }}>{n(p.visitas)}</span>
            <span style={{ fontSize: 12, fontFamily: MONO, color: p.pos <= 5 ? T.teal : p.pos <= 10 ? T.textMuted : T.textGhost, textAlign: "right", fontWeight: p.pos <= 5 ? 600 : 400 }}>{p.pos.toFixed(1)}</span>
            <span style={{ fontSize: 12, fontFamily: MONO, color: p.ctr >= 10 ? T.orange : T.textMuted, textAlign: "right" }}>{p.ctr}%</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
              {p.cambio > 0 && <ArrowUpIcon size={10} color={T.teal} />}
              {p.cambio < 0 && <ArrowDownIcon size={10} color={T.red} />}
              <span style={{ fontSize: 11, fontFamily: MONO, color: p.cambio > 0 ? T.teal : p.cambio < 0 ? T.red : T.textGhost }}>
                {p.cambio > 0 ? "+" : ""}{n(Math.abs(p.cambio))}
              </span>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ── Tab: Keywords & Clusters ──────────────────────────────────────────────────

function KeywordsTab() {
  const [open, setOpen] = useState<number>(0);

  const intentColor = (intent: string) => intent === "Comercial" ? T.orange : T.blue;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Rank evolution chart */}
      <Panel style={{ padding: "20px 22px" }}>
        <SectionTitle>Evolución de posición — keywords principales por desarrollo</SectionTitle>
        <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
          {[
            { label: "AUKENA", color: T.orange },
            { label: "TURQUESA", color: T.blue },
            { label: "BONZA", color: T.teal },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 2, background: l.color, borderRadius: 1 }} />
              <span style={{ fontSize: 11, color: T.textMuted, fontFamily: MONO }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
            <div style={{ width: 14, height: 1, background: "rgba(255,255,255,0.15)", borderRadius: 1, borderTop: "1px dashed rgba(255,255,255,0.15)" }} />
            <span style={{ fontSize: 10, color: T.textGhost }}>Top 10</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={RANK_HISTORY} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <XAxis dataKey="sem" axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} tick={{ fill: T.textGhost, fontSize: 9, fontFamily: SANS }} />
            <RTooltip
              contentStyle={{ background: "rgba(12,12,14,0.96)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10, fontFamily: SANS }}
              labelStyle={{ color: T.textGhost, fontSize: 10, marginBottom: 6 }}
              itemStyle={{ fontSize: 11, fontFamily: MONO }}
              formatter={(val: unknown, name: unknown) => [`Pos. ${val}`, String(name).toUpperCase()]}
            />
            <ReferenceLine y={10} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" strokeWidth={1} />
            {[
              { key: "aukena", color: T.orange },
              { key: "turquesa", color: T.blue },
              { key: "bonza", color: T.teal },
            ].map(l => (
              <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 10, color: T.textGhost, marginTop: 8, textAlign: "right", fontFamily: MONO }}>
          Nota: eje Y invertido — posición menor = mejor ranking
        </div>
      </Panel>

      {/* Clusters acordeón */}
      <Panel style={{ padding: 0, overflow: "hidden" }}>
        {KEYWORDS_CLUSTERS.map((cluster, ci) => (
          <div key={cluster.cluster} style={{ borderBottom: ci < KEYWORDS_CLUSTERS.length - 1 ? `0.5px solid ${T.borderFaint}` : "none" }}>
            <button
              onClick={() => setOpen(open === ci ? -1 : ci)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: cluster.color, flexShrink: 0, boxShadow: `0 0 8px ${cluster.color}60` }} />
              <span style={{ flex: 1, fontSize: 13, color: T.textPrimary, fontWeight: 600, fontFamily: SANS }}>{cluster.cluster}</span>
              <span style={{ fontSize: 10, fontFamily: MONO, color: cluster.color }}>{cluster.desarrollo}</span>
              <span style={{ fontSize: 10, color: T.textGhost, fontFamily: MONO }}>{cluster.keywords.length} keywords</span>
              <span style={{ fontSize: 12, color: T.textGhost, marginLeft: 4 }}>{open === ci ? "▲" : "▼"}</span>
            </button>
            {open === ci && (
              <div style={{ padding: "0 20px 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 110px", gap: 8, padding: "6px 0", borderBottom: `0.5px solid ${T.borderFaint}`, marginBottom: 6 }}>
                  {["Keyword", "Posición", "Vol/mes", "Intención"].map((h, i) => (
                    <span key={h} style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO, textAlign: i === 0 ? "left" : "center" }}>{h}</span>
                  ))}
                </div>
                {cluster.keywords.map((kw, ki) => (
                  <div key={ki} style={{ display: "grid", gridTemplateColumns: "1fr 70px 90px 110px", gap: 8, padding: "8px 0", borderBottom: ki < cluster.keywords.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS }}>{kw.kw}</span>
                    <span style={{ fontSize: 12, fontFamily: MONO, color: kw.pos <= 10 ? cluster.color : T.textMuted, textAlign: "center", fontWeight: kw.pos <= 10 ? 600 : 400 }}>{kw.pos}</span>
                    <span style={{ fontSize: 11, fontFamily: MONO, color: T.textMuted, textAlign: "center" }}>{n(kw.vol)}</span>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, padding: "2px 9px", background: `${intentColor(kw.intent)}15`, border: `0.5px solid ${intentColor(kw.intent)}40`, borderRadius: 20, color: intentColor(kw.intent), fontWeight: 500 }}>
                        {kw.intent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ── Tab: Técnico ──────────────────────────────────────────────────────────────

function TecnicoTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Global CWV summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "LCP (Largest Contentful Paint)", desc: "Tiempo de carga del elemento principal visible", threshold: "≤ 2.5s bueno", score: "1.8s", color: T.teal, icon: ZapIcon },
          { label: "CLS (Cumulative Layout Shift)", desc: "Estabilidad visual de la página al cargar", threshold: "≤ 0.10 bueno", score: "0.05", color: T.teal, icon: ShieldCheckIcon },
          { label: "INP (Interaction to Next Paint)", desc: "Respuesta a interacciones del usuario", threshold: "≤ 200ms bueno", score: "87ms", color: T.teal, icon: ZapIcon },
        ].map(m => {
          const Icon = m.icon;
          return (
            <Panel key={m.label} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${m.color}15`, border: `0.5px solid ${m.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={m.color} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 500, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: T.textGhost, lineHeight: 1.4 }}>{m.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 26, fontFamily: MONO, color: m.color, fontWeight: 700, letterSpacing: "-0.03em" }}>{m.score}</span>
                <span style={{ fontSize: 10, color: T.textGhost }}>{m.threshold}</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircleIcon size={11} color={m.color} />
                <span style={{ fontSize: 10, color: m.color }}>Pasa el umbral de Google</span>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Per-page scores */}
      <Panel style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px 12px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
          <SectionTitle>Core Web Vitals por página de desarrollo</SectionTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 54px 60px 60px 70px 60px", gap: 8, padding: "8px 20px", borderBottom: `0.5px solid ${T.borderFaint}`, background: T.bgSubtle }}>
          {["Página", "Score", "LCP", "CLS", "INP", "Estado"].map((h, i) => (
            <span key={h} style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO, textAlign: i === 0 ? "left" : "center" }}>{h}</span>
          ))}
        </div>
        {CWV_PAGES.map((p, i) => {
          const overall = p.score >= 90 ? "Bueno" : p.score >= 50 ? "Mejorable" : "Deficiente";
          const overallColor = scoreColor(p.score);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 54px 60px 60px 70px 60px", gap: 8, padding: "12px 20px", borderBottom: i < CWV_PAGES.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontFamily: MONO, color: T.textSecondary }}>/{p.page}</span>
              <div style={{ display: "flex", justifyContent: "center" }}><ScoreRing score={p.score} /></div>
              <div style={{ textAlign: "center" }}><CwvBadge val={p.lcp} label="LCP" metric="lcp" /></div>
              <div style={{ textAlign: "center" }}><CwvBadge val={p.cls} label="CLS" metric="cls" /></div>
              <div style={{ textAlign: "center" }}><CwvBadge val={p.inp} label="INP" metric="inp" /></div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: 10, padding: "3px 9px", background: `${overallColor}15`, border: `0.5px solid ${overallColor}40`, borderRadius: 20, color: overallColor, fontWeight: 600 }}>{overall}</span>
              </div>
            </div>
          );
        })}
      </Panel>

      {/* Indexing status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Páginas indexadas", val: 187, color: T.teal, icon: CheckCircleIcon },
          { label: "Excluidas", val: 23, color: T.textMuted, icon: MinusIcon },
          { label: "Con errores", val: 4, color: T.amber, icon: AlertCircleIcon },
          { label: "Sitemap XML", val: "OK", color: T.teal, icon: CheckCircleIcon },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Panel key={s.label} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Icon size={12} color={s.color} />
                <span style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 22, fontFamily: MONO, color: s.color, fontWeight: 700 }}>{s.val}</span>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Backlinks ─────────────────────────────────────────────────────────────

function BacklinksTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Domain Authority", val: "47", color: T.orange, desc: "Moz DA" },
          { label: "Backlinks totales", val: "1,284", color: T.teal, desc: "Dofollow + nofollow" },
          { label: "Dominios referencia", val: "89", color: T.blue, desc: "Únicos" },
          { label: "Links perdidos (30d)", val: "12", color: T.amber, desc: "Requieren atención" },
        ].map(s => (
          <Panel key={s.label} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontFamily: MONO, color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>{s.desc}</div>
          </Panel>
        ))}
      </div>

      {/* Backlinks table */}
      <Panel style={{ padding: 0 }}>
        <div style={{ padding: "14px 20px 12px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
          <SectionTitle>Dominios de referencia principales</SectionTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 60px 60px 100px 80px", gap: 8, padding: "8px 20px", borderBottom: `0.5px solid ${T.borderFaint}`, background: T.bgSubtle }}>
          {["Dominio", "DA", "Links", "Tipo", "Estado"].map((h, i) => (
            <span key={h} style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO, textAlign: i === 0 ? "left" : "center" }}>{h}</span>
          ))}
        </div>
        {BACKLINKS.map((b, i) => {
          const isLost = b.estado === "perdido";
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 60px 60px 100px 80px", gap: 8, padding: "10px 20px", borderBottom: i < BACKLINKS.length - 1 ? `0.5px solid ${T.borderFaint}` : "none", alignItems: "center", opacity: isLost ? 0.5 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LinkIcon size={12} color={isLost ? T.textGhost : T.blue} />
                <span style={{ fontSize: 12, fontFamily: MONO, color: isLost ? T.textGhost : T.textSecondary, textDecoration: isLost ? "line-through" : "none" }}>{b.dominio}</span>
              </div>
              <span style={{ fontSize: 12, fontFamily: MONO, color: b.da >= 50 ? T.teal : T.textMuted, textAlign: "center", fontWeight: b.da >= 50 ? 600 : 400 }}>{b.da}</span>
              <span style={{ fontSize: 12, fontFamily: MONO, color: T.textMuted, textAlign: "center" }}>{b.links}</span>
              <span style={{ fontSize: 11, color: T.textMuted, textAlign: "center" }}>{b.tipo}</span>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: 10, padding: "2px 9px", background: isLost ? `${T.red}15` : `${T.teal}15`, border: `0.5px solid ${isLost ? T.red : T.teal}40`, borderRadius: 20, color: isLost ? T.red : T.teal, fontWeight: 600 }}>
                  {b.estado}
                </span>
              </div>
            </div>
          );
        })}
      </Panel>

      {/* Oportunidades */}
      <Panel style={{ padding: "18px 20px", background: `${T.blue}08`, borderColor: `${T.blue}20` }}>
        <SectionTitle>Oportunidades de link building detectadas</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { titulo: "PR inmobiliaria digital", desc: "3 medios especializados con DA > 45 sin cobertura", accion: "Proponer nota de prensa" },
            { titulo: "Blogs de arquitectura", desc: "8 blogs activos en MX con audiencia de perfil inversor", accion: "Outreach colaboración" },
            { titulo: "Recuperar links perdidos", desc: "12 backlinks perdidos en los últimos 30 días, 4 recuperables", accion: "Contactar administradores" },
          ].map(o => (
            <div key={o.titulo} style={{ padding: "14px 16px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}` }}>
              <div style={{ fontSize: 12, color: T.textPrimary, fontWeight: 600, marginBottom: 6 }}>{o.titulo}</div>
              <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{o.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.blue }} />
                <span style={{ fontSize: 10, color: T.blue, fontWeight: 500 }}>{o.accion}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SeoPage() {
  const [tab, setTab] = useState<Tab>("Rendimiento");

  const lastMonth = ORGANIC_TREND[ORGANIC_TREND.length - 1];
  const prevMonth = ORGANIC_TREND[ORGANIC_TREND.length - 2];
  const growth = (((lastMonth.visitas - prevMonth.visitas) / prevMonth.visitas) * 100).toFixed(1);

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, fontFamily: SANS }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, color: T.textPrimary, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: SANS }}>SEO</h1>
          <p style={{ margin: "4px 0 0", color: T.textSecondary, fontSize: 13 }}>Posicionamiento orgánico · Core Web Vitals · Keywords · Backlinks</p>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 22, fontFamily: MONO, color: T.teal, fontWeight: 700 }}>{n(lastMonth.visitas)}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <ArrowUpIcon size={12} color={T.teal} />
                <span style={{ fontSize: 12, fontFamily: MONO, color: T.teal }}>+{growth}%</span>
              </div>
            </div>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>Visitas orgánicas / mes</div>
          </div>
          <div style={{ width: "0.5px", height: 32, background: T.borderFaint }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontFamily: MONO, color: T.orange, fontWeight: 700 }}>47</div>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>Domain Authority</div>
          </div>
        </div>
      </div>

      {/* KPI bar */}
      <Panel style={{ padding: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)" }}>
          {[
            { label: "Keywords top 3", val: "8", color: T.teal, icon: TrendingUpIcon },
            { label: "Keywords top 10", val: "23", color: T.orange, icon: SearchIcon },
            { label: "Keywords top 20", val: "51", color: T.textSecondary, icon: SearchIcon },
            { label: "Backlinks activos", val: "1,272", color: T.blue, icon: LinkIcon },
            { label: "Páginas indexadas", val: "187", color: T.purple, icon: FileTextIcon },
            { label: "CWV · Páginas OK", val: "5/6", color: T.teal, icon: CheckCircleIcon },
          ].map((k, i) => {
            const Icon = k.icon;
            return (
              <React.Fragment key={k.label}>
                {i > 0 && <div style={{ width: "0.5px", background: T.borderFaint }} />}
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon size={12} color={k.color} />
                    <span style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</span>
                  </div>
                  <span style={{ fontSize: 20, fontFamily: MONO, color: k.color, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{k.val}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Panel>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: `0.5px solid ${T.borderFaint}` }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ height: 36, padding: "0 16px", background: "transparent", border: "none", borderBottom: tab === t ? `2px solid ${T.orange}` : "2px solid transparent", color: tab === t ? T.textPrimary : T.textMuted, fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: "pointer", fontFamily: SANS, marginBottom: -1, transition: "all 0.15s" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Rendimiento" && <RendimientoTab />}
      {tab === "Keywords & Clusters" && <KeywordsTab />}
      {tab === "Técnico" && <TecnicoTab />}
      {tab === "Backlinks" && <BacklinksTab />}
    </div>
  );
}
