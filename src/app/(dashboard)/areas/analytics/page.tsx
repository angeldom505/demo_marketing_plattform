"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, {
  useEffect, useState, useCallback, useRef, useMemo,
} from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, LabelList, ReferenceLine,
} from "recharts";
import {
  ChevronDownIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon,
  ArrowUpDownIcon, XIcon, CalendarIcon, TrendingUpIcon, GlobeIcon,
  UsersIcon, TargetIcon, ZapIcon,
} from "lucide-react";

import { T, PALETTE } from "@/styles/tokens";
import { PanelHeader } from "@/components/ui/panel-header";
import { DeltaBadge } from "@/components/ui/delta-badge";
import { FunnelChart, type FunnelStage } from "@/components/ui/funnel-chart";
import { DonutChart, DonutLegend, type DonutSegment } from "@/components/ui/donut-chart";
import {
  ResizableTableContainer,
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
} from "@/components/ui/resizable-table";

// ── Fonts ─────────────────────────────────────────────────────────────
const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Lifecycle ─────────────────────────────────────────────────────────
const LC_LABEL: Record<string, string> = {
  subscriber:             "Suscriptor",
  "231944871":            "Contacto",
  lead:                   "Lead",
  marketingqualifiedlead: "MQL",
  salesqualifiedlead:     "SQL",
  opportunity:            "Oportunidad",
  customer:               "Cliente",
  "994640505":            "Cancelado",
  sin_etapa:              "Sin etapa",
};

const FUNNEL_KEYS = [
  "subscriber", "231944871", "lead", "marketingqualifiedlead",
  "salesqualifiedlead", "opportunity", "customer",
];

const LC_COLOR: Record<string, string> = {
  subscriber:             T.purple + "88",
  "231944871":            T.purple,
  lead:                   "#9B8FE8",
  marketingqualifiedlead: T.teal,
  salesqualifiedlead:     T.orange,
  opportunity:            T.amber,
  customer:               T.blue,
  "994640505":            T.red + "bb",
  sin_etapa:              "rgba(255,255,255,0.15)",
};

// ── Tipos ──────────────────────────────────────────────────────────────
type Item      = { label: string; count: number };
type MonthItem = { mes: string; count: number };

type Analytics = {
  total_contactos:   number;
  by_lifecycle:      Item[];
  by_canal:          Item[];
  by_subcanal?:      Item[];
  by_modelo:         Item[];
  by_generacion:     Item[];
  by_utm_source:     Item[];
  by_utm_campaign:   Item[];
  by_source_label:   Item[];
  contactos_por_mes: MonthItem[];
  by_municipio:      Item[];
  by_desarrollo:     Item[];
  capacidad?: {
    promedio: number; mediana: number;
    p25: number; p75: number; con_dato: number;
    rangos: { label: string; count: number; orden: number }[];
  };
};

type GeoData = {
  by_pais:             Array<{ label: string; total: number; mqls: number; clientes: number; calificados: number; tasa: number }>;
  by_municipio_detail: Array<{ label: string; total: number; mqls: number; sqls: number; clientes: number; calificados: number; tasa: number }>;
  by_genero:           Array<{ genero: string; lc: string; cnt: number }>;
  by_genero_modelo:    Array<{ genero: string; modelo: string; cnt: number }>;
  by_genero_cap:       Array<{ genero: string; rango: string; cnt: number }>;
  zip_density:         Array<{ zip: string; total: number; mqls: number }>;
};

type SyncStatus = {
  status: string; contacts_status: string;
  last_sync_at: string | null; total_contacts: number;
};

type Period   = "7D" | "30D" | "90D" | "YTD" | "ALL" | "CUSTOM";
type SortDir  = "asc" | "desc";
type FunnelMode = "live" | "conversion"; // kept for backwards compat, not used in UI
type GeoTab   = "overview" | "detail" | "paises" | "genero";
type AudTab   = "generacion" | "modelo" | "capacidad";
type TrendFreq   = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
type CompareMode = "none" | "prev_period" | "prev_year" | "all_years";
type TrendPoint  = { fecha: string; count: number };

// ── Helpers ───────────────────────────────────────────────────────────
const n = (v: number | null | undefined) =>
  v == null || isNaN(v as number) ? "0" : v.toLocaleString("es-MX");

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const pctNum = (a: number, b: number) => b ? (a / b * 100) : 0;
const pctStr = (a: number, b: number) => b ? (a / b * 100).toFixed(1) + "%" : "—";

const fmtMXN = (v: number) =>
  v >= 1_000_000 ? "$" + (v / 1_000_000).toFixed(1) + "M"
  : v >= 1_000   ? "$" + Math.round(v / 1_000) + "k"
  : "$" + n(v);

function periodToParams(period: Period, customFrom: string, customTo: string): { from?: string; to?: string } {
  if (period === "ALL") return {};
  if (period === "CUSTOM") {
    if (customFrom) return { from: customFrom, to: customTo || new Date().toISOString().slice(0, 10) };
    return {};
  }
  const now = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toStr = iso(now);
  if (period === "7D")  { const f = new Date(now); f.setDate(f.getDate() - 7);   return { from: iso(f), to: toStr }; }
  if (period === "30D") { const f = new Date(now); f.setDate(f.getDate() - 30);  return { from: iso(f), to: toStr }; }
  if (period === "90D") { const f = new Date(now); f.setDate(f.getDate() - 90);  return { from: iso(f), to: toStr }; }
  if (period === "YTD") return { from: `${now.getFullYear()}-01-01`, to: toStr };
  return {};
}

const MES_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

// ── Trend helpers ─────────────────────────────────────────────────────
const FREQ_OPTS: { key: TrendFreq; short: string; label: string }[] = [
  { key: "daily",     short: "D", label: "Diario" },
  { key: "weekly",    short: "S", label: "Semanal" },
  { key: "monthly",   short: "M", label: "Mensual" },
  { key: "quarterly", short: "T", label: "Trimestral" },
  { key: "yearly",    short: "A", label: "Anual" },
];

const COMPARE_OPTS: { key: CompareMode; label: string }[] = [
  { key: "none",        label: "Sin comparar" },
  { key: "prev_period", label: "Período anterior" },
  { key: "prev_year",   label: "Año anterior" },
  { key: "all_years",   label: "Todos los años" },
];

const YEAR_COLORS = [T.orange, T.teal, T.purple, T.blue, T.amber, "#F472B6", "#34D399"] as const;

function fmtTrendLabel(fecha: string, freq: TrendFreq): string {
  if (freq === "daily" || freq === "weekly") {
    const d = new Date(fecha + "T12:00:00");
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  }
  if (freq === "monthly") {
    const yr = fecha.substring(2, 4);
    const mo = parseInt(fecha.substring(5, 7), 10) - 1;
    return `${MES_LABELS[mo] ?? ""} '${yr}`;
  }
  if (freq === "quarterly") {
    // "2024-T1" → "T1 '24"
    const yr = fecha.substring(2, 4);
    const qt = fecha.substring(5); // "T1"
    return `${qt} '${yr}`;
  }
  return fecha; // yearly "2024"
}

function fmtYAxis(v: number): string {
  return v >= 1000 ? Math.round(v / 1000) + "k" : String(v);
}

// ── Shimmer ───────────────────────────────────────────────────────────
const shimmerStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, ${T.bgSubtle} 25%, rgba(255,255,255,0.04) 50%, ${T.bgSubtle} 75%)`,
  backgroundSize: "800px 100%", animation: "shimmer 1.5s infinite", borderRadius: 6,
};
function Skel({ h = 16, w = "100%" }: { h?: number; w?: string | number }) {
  return <div style={{ height: h, width: w, ...shimmerStyle }} />;
}
function SkeletonPanel({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background: T.bgPanel, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusLg, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
      <Skel h={11} w="40%" />
      {Array.from({ length: rows }).map((_, i) => <Skel key={i} h={14} w={`${80 - i * 6}%`} />)}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.bgPanel, border: `0.5px solid ${T.borderDefault}`,
      borderRadius: T.radiusLg, padding: "20px 22px", position: "relative",
      overflow: "hidden", fontFamily: SANS, ...style,
    }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 60%)" }} />
      {children}
    </div>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────
function TabBar<T extends string>({ tabs, active, onChange }: {
  tabs: { key: T; label: string }[]; active: T; onChange: (t: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 2, background: T.bgSubtle, borderRadius: T.radiusMd, padding: 3, border: `0.5px solid ${T.borderFaint}` }}>
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)} style={{
          padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
          background: active === tab.key ? T.bgPanel : "transparent",
          color: active === tab.key ? T.textPrimary : T.textMuted,
          fontSize: 11, fontWeight: 500, fontFamily: SANS,
          boxShadow: active === tab.key ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
          transition: "all 150ms", letterSpacing: "0.01em",
        }}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Sortable Table ─────────────────────────────────────────────────────
interface SortableTableProps {
  data: Item[]; total?: number; maxHeight?: number;
  searchable?: boolean; accentColor?: string; showRank?: boolean;
}
function SortableTable({ data, total, maxHeight = 420, searchable = false, accentColor = T.purple, showRank = false }: SortableTableProps) {
  const [sortCol, setSortCol] = useState<"label" | "count">("count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [query,   setQuery]   = useState("");
  const tot    = total ?? data.reduce((s, i) => s + i.count, 0);
  const maxVal = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

  const sorted = useMemo(() => {
    let rows = query.trim()
      ? data.filter(r => r.label.toLowerCase().includes(query.trim().toLowerCase()))
      : data;
    return [...rows].sort((a, b) => {
      if (sortCol === "label") { const c = a.label.localeCompare(b.label, "es"); return sortDir === "asc" ? c : -c; }
      return sortDir === "asc" ? a.count - b.count : b.count - a.count;
    });
  }, [data, sortCol, sortDir, query]);

  const handleSort = (col: "label" | "count") => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  return (
    <div>
      {searchable && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusMd, padding: "6px 10px", marginBottom: 10 }}>
          <SearchIcon size={12} color={T.textGhost} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..."
            style={{ background: "none", border: "none", outline: "none", color: T.textPrimary, fontSize: 12, fontFamily: SANS, width: "100%" }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: T.textGhost, cursor: "pointer", padding: 0 }}>×</button>}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: showRank ? "28px 1fr 70px 52px 44px" : "1fr 70px 52px 44px", gap: 6, padding: "4px 6px 6px", marginBottom: 2, borderBottom: `0.5px solid ${T.borderFaint}` }}>
        {showRank && <div style={{ fontSize: 9, color: T.textGhost, fontFamily: MONO }}>#</div>}
        <button onClick={() => handleSort("label")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: sortCol === "label" ? T.textSecondary : T.textGhost, fontSize: 9, fontFamily: SANS, textAlign: "left", letterSpacing: "0.07em", textTransform: "uppercase", padding: 0 }}>
          Etiqueta {sortCol === "label" ? (sortDir === "asc" ? <ArrowUpIcon size={10} color={accentColor} /> : <ArrowDownIcon size={10} color={accentColor} />) : <ArrowUpDownIcon size={10} color={T.textGhost} />}
        </button>
        <div />
        <button onClick={() => handleSort("count")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", color: sortCol === "count" ? T.textSecondary : T.textGhost, fontSize: 9, fontFamily: MONO, letterSpacing: "0.07em", textTransform: "uppercase", padding: 0 }}>
          {sortCol === "count" ? (sortDir === "asc" ? <ArrowUpIcon size={10} color={accentColor} /> : <ArrowDownIcon size={10} color={accentColor} />) : <ArrowUpDownIcon size={10} color={T.textGhost} />} N
        </button>
        <div style={{ fontSize: 9, color: T.textGhost, fontFamily: MONO, textAlign: "right", letterSpacing: "0.07em" }}>%</div>
      </div>
      <div style={{ maxHeight, overflowY: sorted.length > 15 ? "auto" : "visible" }}>
        {sorted.length === 0
          ? <div style={{ fontSize: 12, color: T.textGhost, padding: "12px 6px", fontFamily: SANS }}>Sin resultados</div>
          : sorted.map(({ label, count }, idx) => {
              const barW = count > 0 ? Math.max(2, Math.round((count / maxVal) * 100)) : 0;
              return (
                <div key={label} style={{
                  display: "grid",
                  gridTemplateColumns: showRank ? "28px 1fr 70px 52px 44px" : "1fr 70px 52px 44px",
                  gap: 6, alignItems: "center", padding: "5px 6px",
                  borderRadius: 5, margin: "0 -6px",
                  transition: "background 100ms",
                }}>
                  {showRank && <span style={{ fontSize: 10, fontFamily: MONO, color: T.textGhost, textAlign: "right" }}>{String(idx + 1).padStart(2, "0")}</span>}
                  <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>{label}</span>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${barW}%`, background: accentColor, borderRadius: 2, opacity: 0.75 }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: MONO, color: T.textSecondary, textAlign: "right" }}>{n(count)}</span>
                  <span style={{ fontSize: 10, fontFamily: MONO, color: T.textMuted, textAlign: "right" }}>{pctStr(count, tot)}</span>
                </div>
              );
            })}
      </div>
    </div>
  );
}

// ── Metrics Bar ───────────────────────────────────────────────────────
function MetricsBar({ analytics }: { analytics: Analytics }) {
  const lc = Object.fromEntries((analytics.by_lifecycle ?? []).map(i => [i.label, i.count]));
  const total     = analytics.total_contactos ?? 0;
  const leads     = lc["lead"] ?? 0;
  const mqls      = lc["marketingqualifiedlead"] ?? 0;
  const sqls      = lc["salesqualifiedlead"] ?? 0;
  const customers = lc["customer"] ?? 0;

  const metrics = [
    { label: "Total contactos",  value: n(total),                                                                color: T.purple },
    { label: "Leads",            value: n(leads),                                                                color: T.textSecondary },
    { label: "MQLs",             value: n(mqls),                                                                 color: T.teal },
    { label: "SQLs",             value: n(sqls),                                                                 color: T.orange },
    { label: "Clientes",         value: n(customers),                                                            color: T.blue },
    { label: "Lead → MQL",       value: pctNum(mqls, leads).toFixed(1) + "%",   color: pctNum(mqls, leads) >= 10 ? T.teal : pctNum(mqls, leads) >= 3 ? T.amber : T.red },
    { label: "MQL → SQL",        value: pctNum(sqls, mqls).toFixed(1) + "%",    color: pctNum(sqls, mqls) >= 10 ? T.teal : pctNum(sqls, mqls) >= 3 ? T.amber : T.red },
    { label: "SQL → Cliente",    value: pctNum(customers, sqls).toFixed(1) + "%", color: pctNum(customers, sqls) >= 10 ? T.teal : pctNum(customers, sqls) >= 3 ? T.amber : T.red },
  ];

  return (
    <div style={{ background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusLg, display: "flex", alignItems: "stretch", overflow: "hidden", marginBottom: 14 }}>
      {metrics.map((m, i) => (
        <React.Fragment key={m.label}>
          {i > 0 && <div style={{ width: "0.5px", background: T.borderFaint, flexShrink: 0 }} />}
          <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</div>
            <div style={{ fontSize: 15, fontFamily: MONO, color: m.color, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>{m.value}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Funnel Section ────────────────────────────────────────────────────
function FunnelSection({ analytics }: { analytics: Analytics }) {
  const lc    = Object.fromEntries((analytics.by_lifecycle ?? []).map(i => [i.label, i.count]));
  const total = analytics.total_contactos ?? 1;

  // Funnel Vivo — raw counts as-is; may NOT be a pyramid, that's expected
  const liveFunnelData: FunnelStage[] = useMemo(() => {
    return FUNNEL_KEYS.map(key => ({
      label: LC_LABEL[key] ?? key,
      value: lc[key] ?? 0,
      displayValue: n(lc[key] ?? 0),
      color: LC_COLOR[key] ?? T.purple,
    })).filter(s => s.value > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics]);

  // The badge shows "% of total DB currently at this stage".
  // FunnelChart internally computes pct = (value / maxValue) * 100, so:
  // actual_count = pct * liveMaxValue / 100  →  % of DB = actual_count / total * 100
  const liveMaxValue = Math.max(...liveFunnelData.map(d => d.value), 1);
  const livePctFormatter = useCallback(
    (pct: number) => ((pct / 100) * liveMaxValue / total * 100).toFixed(1) + "%",
    [liveMaxValue, total]
  );

  // Funnel Estático — cumulative: each stage = contacts at that stage OR more advanced.
  // Guarantees a non-increasing series → real pyramid shape.
  const staticFunnelData: FunnelStage[] = useMemo(() => {
    const cumulative = FUNNEL_KEYS.map((_, i) =>
      FUNNEL_KEYS.slice(i).reduce((sum, k) => sum + (lc[k] ?? 0), 0)
    );
    return FUNNEL_KEYS.map((key, i) => ({
      label: LC_LABEL[key] ?? key,
      value: Math.max(cumulative[i] ?? 0, 0),
      displayValue: n(cumulative[i] ?? 0),
      color: LC_COLOR[key] ?? T.purple,
    })).filter(s => s.value > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics]);

  const cancelados = lc["994640505"] ?? 0;
  const sinEtapa   = lc["sin_etapa"] ?? 0;

  return (
    <Panel style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted }}>
            Funnel de conversión
          </span>
          <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 6px", borderRadius: 4, background: T.bgSubtle, color: T.textGhost, border: `0.5px solid ${T.borderFaint}` }}>
            {n(total)} total
          </span>
        </div>
      </div>

      {/* Two funnels side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 16 }}>
        {/* Funnel Vivo */}
        <div>
          <div style={{ marginBottom: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.textSecondary, fontFamily: SANS }}>
              Funnel Vivo
            </span>
            <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS }}>
              Estado actual · % del total BD
            </span>
          </div>
          <FunnelChart
            data={liveFunnelData}
            maxValue={liveMaxValue}
            orientation="horizontal"
            layers={3}
            showValues
            showPercentage
            formatPercentage={livePctFormatter}
            showLabels
            staggerDelay={0.08}
            gap={6}
            edges="curved"
            style={{ aspectRatio: "2.5 / 1" }} />
        </div>

        {/* Funnel Estático */}
        <div>
          <div style={{ marginBottom: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: T.textSecondary, fontFamily: SANS }}>
              Funnel Estático
            </span>
            <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS }}>
              Acumulado por etapa · % que alcanzó cada nivel
            </span>
          </div>
          <FunnelChart
            data={staticFunnelData}
            orientation="horizontal"
            layers={3}
            showValues
            showPercentage
            showLabels
            staggerDelay={0.08}
            gap={6}
            edges="curved"
            style={{ aspectRatio: "2.5 / 1" }} />
        </div>
      </div>

      {/* Fuera del funnel */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, alignSelf: "center", marginRight: 4 }}>
          Fuera del funnel
        </span>
        {[
          { label: "Cancelado", value: cancelados, color: T.red },
          { label: "Sin etapa", value: sinEtapa,   color: T.textGhost },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", background: T.bgSubtle, border: `0.5px solid ${T.borderFaint}`, borderRadius: T.radiusMd }}>
            <span style={{ fontSize: 10, color: T.textSecondary, fontFamily: SANS }}>{item.label}</span>
            <span style={{ fontSize: 12, fontFamily: MONO, color: item.color, fontWeight: 500 }}>{n(item.value)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Trend Section ────────────────────────────────────────────────────
function TrendSection({ data, globalFrom, globalTo, periodLabel }: {
  data: MonthItem[];
  globalFrom?: string;
  globalTo?: string;
  periodLabel: string;
}) {
  const [freq,        setFreq]        = useState<TrendFreq>("monthly");
  const [compare,     setCompare]     = useState<CompareMode>("none");
  const [fetchedCurr, setFetchedCurr] = useState<TrendPoint[]>([]);
  const [fetchedPrev, setFetchedPrev] = useState<TrendPoint[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [fetchErr,    setFetchErr]    = useState<string | null>(null);
  const [dropOpen,    setDropOpen]    = useState(false);

  const currYear  = String(new Date().getFullYear());
  const currMonth = new Date().getMonth();

  // ── Derived series from monthly prop ──────────────────────────────
  const monthlyPoints = useMemo<TrendPoint[]>(
    () => data.map(d => ({ fecha: d.mes, count: d.count })),
    [data]
  );

  const quarterlyPoints = useMemo<TrendPoint[]>(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      const yr = d.mes.substring(0, 4);
      const mo = parseInt(d.mes.substring(5, 7), 10);
      const key = `${yr}-T${Math.ceil(mo / 3)}`;
      map.set(key, (map.get(key) ?? 0) + d.count);
    });
    return [...map.entries()].map(([fecha, count]) => ({ fecha, count }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [data]);

  const yearlyPoints = useMemo<TrendPoint[]>(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      const yr = d.mes.substring(0, 4);
      map.set(yr, (map.get(yr) ?? 0) + d.count);
    });
    return [...map.entries()].map(([fecha, count]) => ({ fecha, count }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [data]);

  // All-years overlay data
  const byYear = useMemo(() => {
    const map: Record<string, (number | null)[]> = {};
    data.forEach(d => {
      const yr = d.mes.substring(0, 4);
      const mo = parseInt(d.mes.substring(5, 7), 10);
      if (!map[yr]) map[yr] = new Array(12).fill(null);
      map[yr][mo - 1] = d.count;
    });
    return map;
  }, [data]);
  const years = useMemo(() => Object.keys(byYear).sort(), [byYear]);
  const allYearsData = useMemo(() => MES_LABELS.map((m, i) => {
    const row: Record<string, string | number | null> = { month: m };
    years.forEach(yr => { row[yr] = (yr === currYear && i > currMonth) ? null : (byYear[yr]?.[i] ?? null); });
    return row;
  }), [byYear, years, currYear, currMonth]);

  // ── Fetch for daily / weekly ──────────────────────────────────────
  useEffect(() => {
    if (freq !== "daily" && freq !== "weekly") return;
    const isoFn  = (d: Date) => d.toISOString().slice(0, 10);
    const now    = new Date();
    // Use global period when set; fallback to 90d for D and 180d for S when showing ALL history
    const toStr  = globalTo   ?? isoFn(now);
    const fromStr = globalFrom ?? (() => {
      const f = new Date(now);
      f.setDate(f.getDate() - (freq === "daily" ? 90 : 180));
      return isoFn(f);
    })();
    const cmpParam = compare === "all_years" ? "none" : compare;
    const url = `/api/integrations/hubspot/trend?freq=${freq}&from=${fromStr}&to=${toStr}&compare=${cmpParam}`;

    setLoading(true);
    setFetchErr(null);
    setFetchedCurr([]);
    setFetchedPrev([]);
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setFetchedCurr(d.current ?? []);
          setFetchedPrev(d.previous ?? []);
        } else {
          setFetchErr(d.error ?? "Error al cargar datos");
        }
      })
      .catch(() => setFetchErr("Sin conexión con el servidor"))
      .finally(() => setLoading(false));
  }, [freq, compare, globalFrom, globalTo]);

  // ── Resolve active series ─────────────────────────────────────────
  // For comparison views on monthly/quarterly, window to last N periods
  // so the chart is readable and the comparison is meaningful.
  const activeCurr = useMemo<TrendPoint[]>(() => {
    if (freq === "daily" || freq === "weekly") return fetchedCurr;
    if (freq === "quarterly") {
      // When comparing: show last 8 quarters (2 years) for clean view
      return compare !== "none" && compare !== "all_years"
        ? quarterlyPoints.slice(-8)
        : quarterlyPoints;
    }
    if (freq === "yearly") return yearlyPoints;
    // monthly: when comparing, limit to last 12 months
    return compare !== "none" && compare !== "all_years"
      ? monthlyPoints.slice(-12)
      : monthlyPoints;
  }, [freq, compare, fetchedCurr, monthlyPoints, quarterlyPoints, yearlyPoints]);

  const activePrev = useMemo<TrendPoint[]>(() => {
    if (compare === "none" || compare === "all_years") return [];
    if (freq === "daily" || freq === "weekly") return fetchedPrev;

    if (compare === "prev_year") {
      return activeCurr.map(p => {
        let count = 0;
        if (freq === "monthly") {
          const yr      = String(parseInt(p.fecha.substring(0, 4), 10) - 1);
          const prevKey = yr + p.fecha.substring(4);
          count = monthlyPoints.find(x => x.fecha === prevKey)?.count ?? 0;
        } else if (freq === "quarterly") {
          const yr      = String(parseInt(p.fecha.substring(0, 4), 10) - 1);
          const prevKey = yr + p.fecha.substring(4);
          count = quarterlyPoints.find(x => x.fecha === prevKey)?.count ?? 0;
        } else if (freq === "yearly") {
          const prevKey = String(parseInt(p.fecha, 10) - 1);
          count = yearlyPoints.find(x => x.fecha === prevKey)?.count ?? 0;
        }
        return { fecha: p.fecha, count };
      });
    }

    if (compare === "prev_period") {
      // activeCurr is already windowed (last 12mo / last 8Q).
      // Find where that window starts in the full series, then take the same length before it.
      const getFullSeries = () => {
        if (freq === "monthly")   return monthlyPoints;
        if (freq === "quarterly") return quarterlyPoints;
        if (freq === "yearly")    return yearlyPoints;
        return [];
      };
      const full     = getFullSeries();
      const startIdx = full.findIndex(p => p.fecha === activeCurr[0]?.fecha);
      if (startIdx > 0) {
        const prevSlice = full.slice(Math.max(0, startIdx - activeCurr.length), startIdx);
        return activeCurr.map((_, i) => ({
          fecha: activeCurr[i]?.fecha ?? "",
          count: prevSlice[i]?.count ?? 0,
        }));
      }
    }
    return [];
  }, [compare, freq, activeCurr, fetchedPrev, monthlyPoints, quarterlyPoints, yearlyPoints]);

  // ── Chart data ────────────────────────────────────────────────────
  // labelVal: null = no mostrar etiqueta (cuando hay demasiados puntos)
  const singleData = useMemo(() => {
    const total = activeCurr.length;
    const show = (i: number) => {
      if (total <= 14) return true;
      if (total <= 26) return i % 2 === 0;
      if (total <= 52) return i % 4 === 0;
      return i % 8 === 0;
    };
    return activeCurr.map((p, i) => ({
      ...p,
      label:    fmtTrendLabel(p.fecha, freq),
      labelVal: show(i) ? p.count : null,
      idx: i,
    }));
  }, [activeCurr, freq]);

  const compareData = useMemo(() => {
    const len = Math.max(activeCurr.length, activePrev.length);
    return Array.from({ length: len }, (_, i) => ({
      label:    activeCurr[i] ? fmtTrendLabel(activeCurr[i]!.fecha, freq) : `${i + 1}`,
      current:  activeCurr[i]?.count ?? null,
      previous: activePrev[i]?.count ?? null,
    }));
  }, [activeCurr, activePrev, freq]);

  const showAllYears     = compare === "all_years" && freq === "monthly";
  const showTwoPeriod    = compare !== "none" && compare !== "all_years" && activePrev.length > 0;
  const showEmptyCompare = compare !== "none" && compare !== "all_years" && activePrev.length === 0 && !loading && !fetchErr;
  const avgV             = activeCurr.length ? activeCurr.reduce((s, d) => s + d.count, 0) / activeCurr.length : 0;
  const maxVal           = activeCurr.length ? Math.max(...activeCurr.map(d => d.count)) : 1;
  const ytdIdx           = freq === "monthly" ? activeCurr.findIndex(d => d.fecha.startsWith(currYear)) : -1;
  const showDots         = activeCurr.length <= 36;

  const totCurr = activeCurr.reduce((s, d) => s + d.count, 0);
  const totPrev = activePrev.reduce((s, d) => s + d.count, 0);
  const totDelta = totPrev > 0 ? (totCurr - totPrev) / totPrev * 100 : null;

  // ── Tooltips ──────────────────────────────────────────────────────
  const TT_WRAP: React.CSSProperties = {
    background: "rgba(12,12,14,0.96)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: "11px 14px",
    fontFamily: SANS,
    minWidth: 160,
  };

  const SingleTooltip = useCallback(({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey?: string | number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    // payload[0] podría ser la ReferenceLine si se incluye; buscar la serie "count"
    const countItem = payload.find(p => p.dataKey === "count") ?? payload[payload.length - 1];
    const val = (countItem?.value ?? 0) as number;
    const idx = singleData.findIndex(d => d.label === label);
    const prev = idx > 0 ? singleData[idx - 1]?.count ?? null : null;
    const chg  = prev != null ? (val - prev) / Math.max(prev, 1) * 100 : null;
    const pct  = maxVal > 0 ? Math.round(val / maxVal * 100) : 0;

    return (
      <div style={TT_WRAP}>
        <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 24, fontFamily: MONO, color: T.textPrimary, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {n(val)}
          </span>
          <span style={{ fontSize: 10, color: T.textGhost }}>contactos</span>
        </div>

        {chg != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 7px", borderRadius: 5,
              background: chg >= 0 ? "rgba(20,184,166,0.12)" : "rgba(239,68,68,0.12)",
            }}>
              <span style={{ fontSize: 12, color: chg >= 0 ? T.teal : T.red }}>{chg >= 0 ? "↑" : "↓"}</span>
              <span style={{ fontSize: 11, fontFamily: MONO, color: chg >= 0 ? T.teal : T.red, fontWeight: 700 }}>
                {Math.abs(chg).toFixed(1)}%
              </span>
            </div>
            <span style={{ fontSize: 10, color: T.textGhost }}>vs período anterior</span>
          </div>
        )}

        {/* Mini bar — % of max */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ height: 3, flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: T.orange, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 9, fontFamily: MONO, color: T.textGhost, flexShrink: 0 }}>{pct}% del máx.</span>
        </div>
      </div>
    );
  }, [singleData, maxVal]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const CompareTooltip = useCallback(({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    const cur  = payload.find(p => p.dataKey === "current");
    const prv  = payload.find(p => p.dataKey === "previous");
    const diff = cur?.value != null && prv?.value != null ? cur.value - prv.value : null;
    const pct  = diff != null && prv?.value ? diff / prv.value * 100 : null;

    return (
      <div style={TT_WRAP}>
        <div style={{ fontSize: 10, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          {label}
        </div>

        {/* Current */}
        {cur && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 20, height: 2, background: T.teal, borderRadius: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Actual</div>
              <div style={{ fontSize: 18, fontFamily: MONO, color: T.teal, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {n(cur.value)}
              </div>
            </div>
          </div>
        )}

        {/* Previous */}
        {prv && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: pct != null ? 10 : 0 }}>
            <div style={{ width: 20, height: 0, borderTop: `2px dashed ${T.purple}`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                {compare === "prev_year" ? "Año ant." : "Período ant."}
              </div>
              <div style={{ fontSize: 18, fontFamily: MONO, color: T.purple, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {n(prv.value)}
              </div>
            </div>
          </div>
        )}

        {/* Delta */}
        {pct != null && diff != null && (
          <div style={{ borderTop: `0.5px solid ${T.borderFaint}`, paddingTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 8px", borderRadius: 5,
              background: pct >= 0 ? "rgba(20,184,166,0.12)" : "rgba(239,68,68,0.12)",
            }}>
              <span style={{ fontSize: 14, color: pct >= 0 ? T.teal : T.red }}>{pct >= 0 ? "↑" : "↓"}</span>
              <span style={{ fontSize: 12, fontFamily: MONO, color: pct >= 0 ? T.teal : T.red, fontWeight: 700 }}>
                {Math.abs(pct).toFixed(1)}%
              </span>
            </div>
            <span style={{ fontSize: 10, color: T.textGhost }}>
              {diff >= 0 ? "+" : ""}{n(diff)} contactos
            </span>
          </div>
        )}
      </div>
    );
  }, [compare]);

  // ── Shared axis/cursor props ──────────────────────────────────────
  const xAx = {
    axisLine:  { stroke: "rgba(255,255,255,0.06)" },
    tickLine:  false as const,
    tick:      { fill: T.textGhost, fontSize: 9, fontFamily: SANS },
  };
  const cursorLine = { stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 };
  const itvl = (len: number) => {
    if (len <= 13)  return 0;
    if (len <= 30)  return 4;
    if (len <= 60)  return 7;
    if (len <= 90)  return 13;
    return Math.max(0, Math.floor(len / 10) - 1);
  };

  // LabelList personalizado: pequeño, discreto, sobre cada punto
  const DataLabel = (props: any) => {
    const { x, y, value } = props;
    if (value == null) return null;
    return (
      <text
        x={x} y={y - 7}
        textAnchor="middle"
        fontSize={8}
        fontFamily={MONO}
        fill="rgba(255,255,255,0.38)"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {fmtYAxis(value as number)}
      </text>
    );
  };

  return (
    <Panel style={{ marginBottom: 14 }}>
      {/* ── Header row ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <PanelHeader title="Captación" badge={`${activeCurr.length} períodos`} />
          <div style={{ fontSize: 10, color: T.textGhost, fontFamily: SANS, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: T.orange, opacity: 0.7, flexShrink: 0 }} />
            {FREQ_OPTS.find(f => f.key === freq)?.label} · {periodLabel}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

          {/* Freq pills */}
          <div style={{ display: "flex", background: T.bgSubtle, borderRadius: T.radiusMd, padding: 3, border: `0.5px solid ${T.borderFaint}`, gap: 2 }}>
            {FREQ_OPTS.map(opt => (
              <button key={opt.key} title={opt.label}
                onClick={() => {
                  setFreq(opt.key);
                  setFetchErr(null);
                  if (opt.key !== "monthly" && compare === "all_years") setCompare("none");
                }}
                style={{
                  padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                  background: freq === opt.key ? T.bgPanel : "transparent",
                  color: freq === opt.key ? T.textPrimary : T.textMuted,
                  fontSize: 11, fontWeight: freq === opt.key ? 600 : 400, fontFamily: MONO,
                  boxShadow: freq === opt.key ? "0 1px 4px rgba(0,0,0,0.35)" : "none",
                  transition: "all 120ms", minWidth: 28, letterSpacing: "0.03em",
                }}>
                {opt.short}
              </button>
            ))}
          </div>

          {/* Compare dropdown */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setDropOpen(o => !o)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px 6px 12px", borderRadius: T.radiusMd, cursor: "pointer",
              background: compare !== "none" ? "rgba(20,184,166,0.1)" : T.bgSubtle,
              border: `0.5px solid ${compare !== "none" ? T.teal : T.borderFaint}`,
              color: compare !== "none" ? T.teal : T.textMuted,
              fontSize: 11, fontFamily: SANS, fontWeight: 500, transition: "all 120ms",
            }}>
              <span>{compare === "none" ? "Comparar" : COMPARE_OPTS.find(c => c.key === compare)?.label}</span>
              <ChevronDownIcon size={12} style={{ flexShrink: 0, transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
            </button>
            {dropOpen && (
              <>
                <div onClick={() => setDropOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: T.bgOverlay, border: `0.5px solid ${T.borderEmphasis}`,
                  borderRadius: T.radiusMd, boxShadow: T.shadowFloat,
                  zIndex: 50, minWidth: 175, overflow: "hidden",
                }}>
                  {COMPARE_OPTS
                    .filter(opt => opt.key !== "all_years" || freq === "monthly")
                    .map((opt, i, arr) => (
                      <button key={opt.key} onClick={() => { setCompare(opt.key); setDropOpen(false); }} style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "10px 14px", background: compare === opt.key ? "rgba(255,255,255,0.06)" : "transparent",
                        border: "none", borderBottom: i < arr.length - 1 ? `0.5px solid ${T.borderFaint}` : "none",
                        cursor: "pointer",
                        color: compare === opt.key ? T.teal : T.textSecondary,
                        fontSize: 12, fontFamily: SANS, fontWeight: compare === opt.key ? 500 : 400,
                        transition: "background 80ms",
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {compare === opt.key && opt.key !== "none" && (
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, flexShrink: 0 }} />
                          )}
                          {opt.label}
                        </span>
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0 16px" }}>
          <Skel h={200} />
          <div style={{ display: "flex", gap: 8 }}>
            <Skel h={10} w="25%" />
            <Skel h={10} w="15%" />
          </div>
        </div>
      )}

      {/* ── D/S error: migration not applied ── */}
      {!loading && fetchErr && (freq === "daily" || freq === "weekly") && (
        <div style={{
          height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 10, borderRadius: T.radiusMd, border: `0.5px dashed ${T.borderDefault}`,
          background: "rgba(255,255,255,0.01)",
        }}>
          <ZapIcon size={20} color={T.amber} />
          <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary, fontFamily: SANS }}>
            Vista {freq === "daily" ? "diaria" : "semanal"} no disponible aún
          </div>
          <div style={{ fontSize: 11, color: T.textGhost, fontFamily: SANS, textAlign: "center", maxWidth: 360, lineHeight: 1.6 }}>
            Aplica la migración <span style={{ fontFamily: MONO, color: T.textMuted }}>20260522_trend_fn.sql</span> en el panel SQL de Supabase para habilitar esta vista.
          </div>
        </div>
      )}

      {/* ── Todos los años ── */}
      {!loading && !fetchErr && showAllYears && (
        <div>
          {/* Leyenda con totales */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            {years.map((yr, i) => {
              const yrTotal = (byYear[yr] ?? []).reduce<number>((s, v) => s + (v ?? 0), 0);
              const isThis  = yr === currYear;
              const color   = YEAR_COLORS[i % YEAR_COLORS.length];
              return (
                <div key={yr} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                  background: isThis ? "rgba(255,255,255,0.04)" : "transparent",
                  borderRadius: T.radiusMd,
                  border: `0.5px solid ${isThis ? T.borderFaint : "transparent"}`,
                }}>
                  <div style={{ width: 16, height: isThis ? 3 : 2, background: color, borderRadius: 2, opacity: isThis ? 1 : 0.6 }} />
                  <div>
                    <div style={{ fontSize: 10, fontFamily: MONO, color: isThis ? T.textSecondary : T.textMuted, fontWeight: isThis ? 600 : 400, lineHeight: 1 }}>{yr}</div>
                    <div style={{ fontSize: 9, fontFamily: MONO, color: T.textGhost, marginTop: 2 }}>{n(yrTotal)}{isThis ? " YTD" : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={allYearsData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="month" {...xAx} />
              <YAxis hide />
              <RTooltip
                cursor={cursorLine}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const filled = [...payload].filter(p => p.value != null)
                    .sort((a, b) => (b.value as number) - (a.value as number));
                  return (
                    <div style={TT_WRAP}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
                      {filled.map((p, idx) => (
                        <div key={String(p.dataKey)} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: idx < filled.length - 1 ? 6 : 0 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color as string, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: MONO, flex: 1 }}>{String(p.dataKey)}</span>
                          <span style={{ fontSize: 13, color: "#fff", fontFamily: MONO, fontWeight: 600 }}>{n(p.value as number)}</span>
                          {idx === 0 && <span style={{ fontSize: 9, color: T.amber }}>★</span>}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {years.map((yr, i) => (
                <Line key={yr} type="monotone" dataKey={yr}
                  stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                  strokeWidth={yr === currYear ? 2 : 1.5}
                  strokeOpacity={yr === currYear ? 1 : 0.5}
                  dot={{ r: yr === currYear ? 3 : 2, fill: YEAR_COLORS[i % YEAR_COLORS.length], stroke: T.bgPanel, strokeWidth: 1.5 }}
                  activeDot={{ r: 5, stroke: T.bgPanel, strokeWidth: 2 }}
                  connectNulls={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Comparación dos períodos ── */}
      {!loading && !fetchErr && showTwoPeriod && (
        <div>
          {/* KPI header */}
          <div style={{ display: "flex", alignItems: "stretch", marginBottom: 16, background: "rgba(255,255,255,0.02)", border: `0.5px solid ${T.borderFaint}`, borderRadius: T.radiusMd, overflow: "hidden" }}>
            <div style={{ flex: 1, padding: "12px 16px", borderRight: `0.5px solid ${T.borderFaint}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 16, height: 2, background: T.teal, borderRadius: 1 }} />
                <span style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS }}>Período actual</span>
              </div>
              <div style={{ fontSize: 22, fontFamily: MONO, color: T.teal, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}>{n(totCurr)}</div>
              <div style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, marginTop: 4 }}>
                {compareData[0]?.label} → {compareData[compareData.length - 1]?.label}
              </div>
            </div>
            <div style={{ flex: 1, padding: "12px 16px", borderRight: `0.5px solid ${T.borderFaint}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 16, height: 0, borderTop: `2px dashed ${T.purple}` }} />
                <span style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS }}>
                  {compare === "prev_year" ? "Año anterior" : "Período anterior"}
                </span>
              </div>
              <div style={{ fontSize: 22, fontFamily: MONO, color: T.purple, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.03em" }}>{n(totPrev)}</div>
              <div style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, marginTop: 4 }}>mismo intervalo</div>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 110 }}>
              {totDelta != null ? (
                <>
                  <div style={{ fontSize: 20, color: totDelta >= 0 ? T.teal : T.red, fontFamily: MONO, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {totDelta >= 0 ? "+" : ""}{totDelta.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, marginTop: 3, textAlign: "center" }}>variación total</div>
                  <div style={{ marginTop: 5, fontSize: 9, fontFamily: MONO, color: totDelta >= 0 ? T.teal : T.red, background: totDelta >= 0 ? "rgba(20,184,166,0.12)" : "rgba(239,68,68,0.12)", padding: "2px 7px", borderRadius: 4 }}>
                    {totDelta >= 0 ? "↑" : "↓"} {n(Math.abs(totCurr - totPrev))}
                  </div>
                </>
              ) : <span style={{ fontSize: 11, color: T.textGhost }}>—</span>}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={compareData} margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="cmpCurr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={T.teal} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={T.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cmpPrev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={T.purple} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={T.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" {...xAx} interval={itvl(compareData.length)} />
              <YAxis hide />
              <RTooltip content={CompareTooltip as any} cursor={cursorLine} />
              <Area type="monotone" dataKey="previous"
                stroke={T.purple} strokeWidth={1.8} strokeDasharray="5 3"
                fill="url(#cmpPrev)"
                dot={showDots ? { r: 2, fill: T.purple, stroke: T.bgPanel, strokeWidth: 1 } : false}
                activeDot={{ r: 4, stroke: T.bgPanel, strokeWidth: 2 }} />
              <Area type="monotone" dataKey="current"
                stroke={T.teal} strokeWidth={2}
                fill="url(#cmpCurr)"
                dot={showDots ? { r: 3, fill: T.teal, stroke: T.bgPanel, strokeWidth: 1.5 } : false}
                activeDot={{ r: 5, stroke: T.bgPanel, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Sin datos comparativos ── */}
      {!loading && !fetchErr && showEmptyCompare && (
        <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: T.radiusMd, border: `0.5px dashed ${T.borderDefault}`, background: "rgba(255,255,255,0.01)" }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: SANS }}>Sin datos de período anterior disponibles</div>
          <div style={{ fontSize: 10, color: T.textGhost, fontFamily: SANS }}>Prueba "Año anterior" o acumula más historial</div>
        </div>
      )}

      {/* ── Período único — siempre AreaChart ── */}
      {!loading && !fetchErr && !showAllYears && !showTwoPeriod && !showEmptyCompare && (
        <div style={{ position: "relative" }}>
          {/* Marcador YTD en mensual */}
          {ytdIdx >= 0 && freq === "monthly" && (
            <div style={{
              position: "absolute",
              left: `${(ytdIdx / Math.max(singleData.length, 1)) * 100}%`,
              top: 0, bottom: 28,
              width: `${((singleData.length - ytdIdx) / Math.max(singleData.length, 1)) * 100}%`,
              background: "rgba(232,93,38,0.03)",
              borderLeft: "1px dashed rgba(232,93,38,0.25)",
              pointerEvents: "none", zIndex: 1,
            }}>
              <span style={{ position: "absolute", top: 3, left: 6, fontSize: 8, color: T.orange, fontFamily: SANS, letterSpacing: "0.05em", opacity: 0.8 }}>YTD</span>
            </div>
          )}

          <ResponsiveContainer width="100%" height={248}>
            <AreaChart data={singleData} margin={{ top: 22, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tgrad-main" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={T.orange} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.orange} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Sin grid */}
              <XAxis dataKey="label" {...xAx} interval={itvl(singleData.length)} />
              <YAxis hide />

              <RTooltip content={SingleTooltip as any} cursor={cursorLine} />

              {/* Línea de promedio — ReferenceLine no contamina el tooltip payload */}
              <ReferenceLine y={avgV} stroke="rgba(255,255,255,0.10)" strokeDasharray="4 4" strokeWidth={1} />

              {/* Serie principal */}
              <Area type="monotone" dataKey="count"
                stroke={T.orange} strokeWidth={2}
                fill="url(#tgrad-main)"
                dot={showDots ? { r: 3, fill: T.orange, stroke: T.bgPanel, strokeWidth: 1.5 } : false}
                activeDot={{ r: 5, fill: T.orange, stroke: T.bgPanel, strokeWidth: 2 }}>
                <LabelList dataKey="labelVal" position="top" content={DataLabel as any} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>

          {/* Footer stats */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 8, borderTop: `0.5px solid ${T.borderFaint}` }}>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 11, textTransform: "none" }}>{n(totCurr)}</span>
              </span>
              <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Prom <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 11, textTransform: "none" }}>{n(Math.round(avgV))}</span>
              </span>
              <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Máx <span style={{ fontFamily: MONO, color: T.orange, fontSize: 11, textTransform: "none" }}>{n(maxVal)}</span>
              </span>
            </div>
            <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, letterSpacing: "0.04em" }}>
              {FREQ_OPTS.find(f => f.key === freq)?.label}
            </span>
          </div>
        </div>
      )}
    </Panel>
  );
}

// ── Canales Panel ─────────────────────────────────────────────────────
function CanalesPanel({ analytics }: { analytics: Analytics }) {
  const [query, setQuery] = useState("");

  const canales = analytics.by_canal ?? [];
  const total   = canales.reduce((s, i) => s + i.count, 0);
  const maxVal  = Math.max(...canales.map(c => c.count), 1);

  const filtered = useMemo(() => {
    if (!query.trim()) return canales;
    return canales.filter(r => r.label.toLowerCase().includes(query.trim().toLowerCase()));
  }, [canales, query]);

  return (
    <Panel style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <PanelHeader title="Canal de captación" badge={`${canales.length} canales`} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusMd, padding: "5px 10px" }}>
          <SearchIcon size={11} color={T.textGhost} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar canal..."
            style={{ background: "none", border: "none", outline: "none", color: T.textPrimary, fontSize: 11, fontFamily: SANS, width: 140 }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: T.textGhost, cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>
          )}
        </div>
      </div>

      <ResizableTableContainer style={{ overflow: "auto", maxHeight: 420 }}>
        <Table aria-label="Canales de captación" style={{ width: "100%", borderCollapse: "collapse", fontFamily: SANS }}>
          <TableHeader style={{ borderBottom: `0.5px solid ${T.borderFaint}` }}>
            <Column id="canal" isRowHeader allowsSorting isResizable
              style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase" as const, letterSpacing: "0.07em", padding: "4px 8px 8px", fontFamily: SANS, minWidth: 160 }}>
              Canal
            </Column>
            <Column id="contactos" allowsSorting isResizable
              style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase" as const, letterSpacing: "0.07em", padding: "4px 8px 8px", fontFamily: MONO, textAlign: "right" as const, minWidth: 90 }}>
              Contactos
            </Column>
            <Column id="pct" isResizable
              style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase" as const, letterSpacing: "0.07em", padding: "4px 8px 8px", fontFamily: MONO, textAlign: "right" as const, minWidth: 70 }}>
              %
            </Column>
            <Column id="proporcion" isResizable
              style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase" as const, letterSpacing: "0.07em", padding: "4px 8px 8px", fontFamily: MONO, minWidth: 120 }}>
              Proporción
            </Column>
          </TableHeader>
          <TableBody>
            {filtered.map(({ label, count }) => {
              const barW   = Math.max(1, Math.round((count / maxVal) * 100));
              const pctVal = pctNum(count, total);
              const isTop  = count >= maxVal * 0.7;
              return (
                <Row key={label} id={label} style={{ borderBottom: `0.5px solid ${T.borderFaint}` }}>
                  <Cell style={{ padding: "7px 8px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textSecondary, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={label}>
                      {isTop && <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.blue, flexShrink: 0, boxShadow: `0 0 6px ${T.blue}` }} />}
                      {label}
                    </span>
                  </Cell>
                  <Cell style={{ padding: "7px 8px", textAlign: "right", fontSize: 12, fontFamily: MONO, color: T.textSecondary }}>
                    {n(count)}
                  </Cell>
                  <Cell style={{ padding: "7px 8px", textAlign: "right", fontSize: 11, fontFamily: MONO, color: T.textMuted }}>
                    {pctVal.toFixed(1)}%
                  </Cell>
                  <Cell style={{ padding: "7px 8px" }}>
                    <div style={{ position: "relative", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barW}%`, background: `linear-gradient(90deg, ${T.blue}, ${T.blue}88)`, borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                  </Cell>
                </Row>
              );
            })}
          </TableBody>
        </Table>
      </ResizableTableContainer>

      <div style={{ marginTop: 10, padding: "8px 12px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: T.textGhost, fontFamily: SANS }}>{canales.length} canales · {n(total)} contactos totales</span>
        <span style={{ fontSize: 10, fontFamily: MONO, color: T.textMuted }}>Actualizado con sync diario 7am</span>
      </div>
    </Panel>
  );
}

// ── Geo Intelligence ──────────────────────────────────────────────────
function GeoSection({ analytics, geo }: { analytics: Analytics; geo: GeoData | null }) {
  const [tab,     setTab]     = useState<GeoTab>("overview");
  const [search,  setSearch]  = useState("");
  type MS = "total" | "mqls" | "sqls" | "clientes" | "tasa";
  const [muniSort, setMuniSort] = useState<MS>("total");
  const [muniDir,  setMuniDir]  = useState<SortDir>("desc");
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);

  type MuniRow = { label: string; total: number; mqls: number; sqls: number; clientes: number; calificados: number; tasa: number };

  const muniData: MuniRow[] = useMemo(() => {
    if (geo?.by_municipio_detail?.length) return geo.by_municipio_detail;
    return (analytics.by_municipio ?? []).map(m => ({ label: m.label, total: m.count, mqls: 0, sqls: 0, clientes: 0, calificados: 0, tasa: 0 }));
  }, [geo, analytics]);

  const maxTotal = useMemo(() => Math.max(...muniData.map(m => m.total), 1), [muniData]);

  const muniFiltered = useMemo(() => {
    let rows = search.trim() ? muniData.filter(r => r.label.toLowerCase().includes(search.trim().toLowerCase())) : muniData;
    return [...rows].sort((a, b) => {
      const av = a[muniSort as keyof MuniRow] as number;
      const bv = b[muniSort as keyof MuniRow] as number;
      return muniDir === "asc" ? av - bv : bv - av;
    });
  }, [muniData, search, muniSort, muniDir]);

  const top10 = useMemo(() => [...muniData].sort((a, b) => b.total - a.total).slice(0, 10), [muniData]);

  const paisData = geo?.by_pais ?? [];

  // Género donut
  const generoTotals: Record<string, number> = useMemo(() => {
    const tot: Record<string, number> = {};
    (geo?.by_genero ?? []).forEach(g => { tot[g.genero] = (tot[g.genero] ?? 0) + g.cnt; });
    return tot;
  }, [geo]);

  const genderDonutData: DonutSegment[] = useMemo(() => {
    const MAP: Record<string, { label: string; color: string }> = {
      HOMBRE:    { label: "Hombre",   color: T.blue },
      MUJER:     { label: "Mujer",    color: T.purple },
      "Sin dato": { label: "Sin dato", color: T.textGhost },
    };
    return Object.entries(generoTotals)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ label: MAP[k]?.label ?? k, value: v, color: MAP[k]?.color ?? T.amber }));
  }, [generoTotals]);

  const generoTotal = useMemo(() => genderDonutData.reduce((s, d) => s + d.value, 0), [genderDonutData]);

  const generoByLc = useMemo(() => {
    if (!geo?.by_genero?.length) return [];
    const map: Record<string, Record<string, number>> = {};
    geo.by_genero.forEach(g => {
      const lcLabel = LC_LABEL[g.lc] ?? g.lc;
      if (!map[lcLabel]) map[lcLabel] = {};
      map[lcLabel][g.genero] = (map[lcLabel][g.genero] ?? 0) + g.cnt;
    });
    return Object.entries(map).map(([lc, genos]) => ({ lc, ...genos }));
  }, [geo]);

  const SortTH = ({ col, label }: { col: MS; label: string }) => (
    <button onClick={() => { if (muniSort === col) setMuniDir(d => d === "asc" ? "desc" : "asc"); else { setMuniSort(col); setMuniDir("desc"); } }}
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, color: muniSort === col ? T.textSecondary : T.textGhost, fontFamily: MONO, letterSpacing: "0.07em", textTransform: "uppercase", textAlign: "right", padding: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
      {label}
      {muniSort === col ? (muniDir === "asc" ? <ArrowUpIcon size={9} color={T.teal} /> : <ArrowDownIcon size={9} color={T.teal} />) : <ArrowUpDownIcon size={9} color={T.textGhost} />}
    </button>
  );

  return (
    <Panel style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <PanelHeader title="Inteligencia geográfica" badge={`${muniData.length} municipios · ${paisData.length} países`} />
        <TabBar<GeoTab>
          tabs={[
            { key: "overview",  label: "Top municipios" },
            { key: "detail",    label: "Detalle completo" },
            { key: "paises",    label: "Internacional" },
            { key: "genero",    label: "Género" },
          ]}
          active={tab} onChange={setTab} />
      </div>

      {/* ── TOP MUNICIPIOS: heat-map bars ── */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Heat bars */}
            <div>
              <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS, marginBottom: 12 }}>
                Volumen de contactos — top 10
              </div>
              {top10.map((row, idx) => {
                const pct = (row.total / maxTotal) * 100;
                const hue = row.tasa >= 10 ? T.teal : row.tasa >= 3 ? T.amber : row.tasa > 0 ? T.orange : T.blue;
                return (
                  <div key={row.label} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: T.textGhost, width: 16 }}>{idx + 1}</span>
                        <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS }}>{row.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 11, fontFamily: MONO, color: T.textSecondary }}>{n(row.total)}</span>
                        {row.mqls > 0 && <span style={{ fontSize: 10, fontFamily: MONO, color: T.teal }}>{n(row.mqls)} MQL</span>}
                        {row.tasa > 0 && <span style={{ fontSize: 10, fontFamily: MONO, color: hue }}>{row.tasa.toFixed(1)}%</span>}
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: `linear-gradient(90deg, ${hue}, ${hue}66)`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats + summary */}
            <div>
              <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS, marginBottom: 12 }}>
                Leyenda de conversión
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {[
                  { color: T.teal,   label: "Alta conversión", desc: "Conv% ≥ 10%" },
                  { color: T.amber,  label: "Media",           desc: "Conv% 3-10%" },
                  { color: T.orange, label: "Baja",            desc: "Conv% < 3%" },
                  { color: T.blue,   label: "Sin dato conv.",  desc: "Sin MQLs/Clientes" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: SANS }}>{item.label}</span>
                    <span style={{ fontSize: 10, color: T.textGhost, fontFamily: SANS }}>— {item.desc}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px", background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}` }}>
                <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS, marginBottom: 10 }}>
                  Resumen geográfico
                </div>
                {[
                  { label: "Municipios con datos", value: muniData.length },
                  { label: "Municipios con MQLs", value: muniData.filter(m => m.mqls > 0).length },
                  { label: "Municipios con Clientes", value: muniData.filter(m => m.clientes > 0).length },
                  { label: "Países detectados", value: paisData.length },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `0.5px solid ${T.borderFaint}` }}>
                    <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: SANS }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontFamily: MONO, color: T.textPrimary }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DETALLE COMPLETO ── */}
      {tab === "detail" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusMd, padding: "6px 10px", marginBottom: 12 }}>
            <SearchIcon size={12} color={T.textGhost} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar municipio..."
              style={{ background: "none", border: "none", outline: "none", color: T.textPrimary, fontSize: 12, fontFamily: SANS, width: "100%" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: T.textGhost, cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>}
          </div>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px 60px 80px", gap: "4px 8px", padding: "4px 6px 8px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
            <span style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, letterSpacing: "0.07em", textTransform: "uppercase" }}>Municipio</span>
            {(["total", "mqls", "sqls", "clientes", "tasa"] as MS[]).map(col => (
              <SortTH key={col} col={col} label={col === "tasa" ? "Conv %" : col.toUpperCase()} />
            ))}
            <div style={{ fontSize: 9, color: T.textGhost, fontFamily: MONO, letterSpacing: "0.07em", textTransform: "uppercase" }}>Proporción</div>
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {muniFiltered.map((row, idx) => (
              <div key={row.label} style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px 60px 80px", gap: "4px 8px", alignItems: "center", padding: "6px 6px", borderBottom: `0.5px solid ${T.borderFaint}`, background: idx < 3 ? "rgba(29,158,117,0.03)" : "transparent" }}>
                <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                  {idx < 3 && <span style={{ fontSize: 9, fontFamily: MONO, color: T.teal, background: T.tealBg, padding: "1px 4px", borderRadius: 3 }}>TOP</span>}
                  {row.label}
                </span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: T.textSecondary, textAlign: "right" }}>{n(row.total)}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: row.mqls > 0 ? T.teal : T.textGhost, textAlign: "right" }}>{row.mqls > 0 ? n(row.mqls) : "—"}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: row.sqls > 0 ? T.orange : T.textGhost, textAlign: "right" }}>{row.sqls > 0 ? n(row.sqls) : "—"}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: row.clientes > 0 ? T.blue : T.textGhost, textAlign: "right" }}>{row.clientes > 0 ? n(row.clientes) : "—"}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, color: row.tasa >= 10 ? T.teal : row.tasa >= 3 ? T.amber : T.textGhost, textAlign: "right" }}>{row.tasa > 0 ? row.tasa.toFixed(1) + "%" : "—"}</span>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(row.total / maxTotal) * 100}%`, background: T.blue, borderRadius: 2, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INTERNACIONAL ── */}
      {tab === "paises" && (
        <div>
          {paisData.length === 0
            ? <div style={{ fontSize: 12, color: T.textGhost, fontFamily: SANS, padding: "24px 0" }}>Sin datos. El endpoint /api/integrations/hubspot/geo debe estar activo.</div>
            : (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Países detectados",      value: paisData.length },
                    { label: "Internacionales",        value: n(paisData.filter(p => p.label !== "México" && p.label !== "Sin dato").reduce((s, p) => s + p.total, 0)) },
                    { label: "México",                 value: n(paisData.find(p => p.label === "México")?.total ?? 0) },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "8px 14px", background: T.bgSubtle, border: `0.5px solid ${T.borderFaint}`, borderRadius: T.radiusMd }}>
                      <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: SANS, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontFamily: MONO, color: T.textPrimary }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px 60px 70px", gap: "4px 10px", padding: "4px 6px 8px", borderBottom: `0.5px solid ${T.borderFaint}` }}>
                  {["País", "Total", "MQLs", "Clientes", "Conv %"].map(h => (
                    <span key={h} style={{ fontSize: 9, color: T.textGhost, fontFamily: h === "País" ? SANS : MONO, letterSpacing: "0.07em", textTransform: "uppercase", textAlign: h === "País" ? "left" : "right" }}>{h}</span>
                  ))}
                </div>
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {[...paisData].filter(p => p.label !== "Sin dato").sort((a, b) => b.total - a.total).map((p, i) => (
                    <div key={p.label} style={{ display: "grid", gridTemplateColumns: "1fr 70px 60px 60px 70px", gap: "4px 10px", alignItems: "center", padding: "6px 6px", borderBottom: `0.5px solid ${T.borderFaint}`, background: i === 0 ? "rgba(74,144,217,0.04)" : "transparent" }}>
                      <span style={{ fontSize: 12, color: i === 0 ? T.textPrimary : T.textSecondary, fontFamily: SANS, display: "flex", alignItems: "center", gap: 6 }}>
                        {p.label === "México" && <span style={{ fontSize: 9, fontFamily: MONO, color: T.blue, background: T.blueBg, padding: "1px 4px", borderRadius: 3 }}>MX</span>}
                        {p.label}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: MONO, color: T.textSecondary, textAlign: "right" }}>{n(p.total)}</span>
                      <span style={{ fontSize: 11, fontFamily: MONO, color: p.mqls > 0 ? T.teal : T.textGhost, textAlign: "right" }}>{p.mqls > 0 ? n(p.mqls) : "—"}</span>
                      <span style={{ fontSize: 11, fontFamily: MONO, color: p.clientes > 0 ? T.blue : T.textGhost, textAlign: "right" }}>{p.clientes > 0 ? n(p.clientes) : "—"}</span>
                      <span style={{ fontSize: 11, fontFamily: MONO, color: p.tasa >= 10 ? T.teal : p.tasa >= 3 ? T.amber : T.textGhost, textAlign: "right" }}>{p.tasa > 0 ? p.tasa.toFixed(1) + "%" : "—"}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>
      )}

      {/* ── GÉNERO ── */}
      {tab === "genero" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, marginBottom: 16 }}>
              Distribución por género
            </div>
            {genderDonutData.length > 0 ? (
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <DonutChart
                  data={genderDonutData} size={160} strokeWidth={22}
                  onSegmentHover={s => setHoveredGender(s?.label ?? null)}
                  centerContent={
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontFamily: MONO, color: T.textPrimary, fontWeight: 500 }}>{n(generoTotal)}</div>
                      <div style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS }}>total</div>
                    </div>
                  } />
                <DonutLegend data={genderDonutData} total={generoTotal} hoveredLabel={hoveredGender} onHover={setHoveredGender} />
              </div>
            ) : (
              <div style={{ fontSize: 12, color: T.textGhost, fontFamily: SANS }}>Sin datos de género</div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, marginBottom: 16 }}>
              Género por etapa del ciclo de vida
            </div>
            {generoByLc.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={generoByLc} layout="vertical" margin={{ left: 10, right: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: T.textGhost, fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? Math.round(v / 1000) + "k" : String(v)} />
                  <YAxis type="category" dataKey="lc" tick={{ fill: T.textGhost, fontSize: 10, fontFamily: SANS }} axisLine={false} tickLine={false} width={75} />
                  <RTooltip contentStyle={{ background: T.bgOverlay, border: `0.5px solid ${T.borderEmphasis}`, borderRadius: T.radiusMd, fontFamily: SANS, fontSize: 11 }} />
                  <Bar dataKey="HOMBRE" name="Hombre" fill={T.blue} opacity={0.85} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="MUJER"  name="Mujer"  fill={T.purple} opacity={0.85} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ fontSize: 12, color: T.textGhost, fontFamily: SANS }}>Sin datos detallados</div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

// ── Audiencias ────────────────────────────────────────────────────────
function AudienciasSection({ analytics }: { analytics: Analytics }) {
  const [tab, setTab] = useState<AudTab>("generacion");
  const [hoveredGen, setHoveredGen] = useState<string | null>(null);

  const generaciones = analytics.by_generacion ?? [];
  const modelos      = analytics.by_modelo ?? [];
  const capacidad    = analytics.capacidad;

  const GEN_COLORS: Record<string, string> = {
    "Generación Z": T.teal,   "Gen Z": T.teal,
    "Millennial":   T.orange, "Milenial": T.orange,
    "Generación X": T.blue,   "Gen X": T.blue,
    "Baby Boomer":  T.amber,  "Boomer": T.amber,
    "Silent":       T.purple,
  };

  const genDonutData: DonutSegment[] = useMemo(() => generaciones.map((g, i) => ({
    label: g.label, value: g.count, color: GEN_COLORS[g.label] ?? PALETTE[i % PALETTE.length],
  })), [generaciones]);
  const genTotal = useMemo(() => genDonutData.reduce((s, d) => s + d.value, 0), [genDonutData]);

  return (
    <Panel style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <PanelHeader title="Audiencias" badge={`${generaciones.length} generaciones · ${modelos.length} modelos`} />
        <TabBar<AudTab>
          tabs={[{ key: "generacion", label: "Generación" }, { key: "modelo", label: "Modelos" }, { key: "capacidad", label: "Capacidad bancaria" }]}
          active={tab} onChange={setTab} />
      </div>

      {tab === "generacion" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 32, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, marginBottom: 14 }}>
              Distribución generacional
            </div>
            {generaciones.length === 0 ? <div style={{ fontSize: 12, color: T.textGhost, fontFamily: SANS }}>Sin datos</div>
              : generaciones.sort((a, b) => b.count - a.count).map(g => {
                const maxG = Math.max(...generaciones.map(x => x.count), 1);
                const isH  = hoveredGen === g.label;
                return (
                  <div key={g.label} style={{ marginBottom: 12 }}
                    onMouseEnter={() => setHoveredGen(g.label)}
                    onMouseLeave={() => setHoveredGen(null)}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: isH ? T.textPrimary : T.textSecondary, fontFamily: SANS, transition: "color 120ms" }}>{g.label}</span>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 12, fontFamily: MONO, color: T.textSecondary }}>{n(g.count)}</span>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: T.textMuted, width: 44, textAlign: "right" }}>{pctStr(g.count, genTotal)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(g.count / maxG) * 100}%`, background: GEN_COLORS[g.label] ?? T.purple, borderRadius: 4, opacity: isH ? 1 : 0.8, transition: "opacity 120ms, width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {genDonutData.length > 0 && (
              <>
                <DonutChart data={genDonutData} size={180} strokeWidth={24}
                  onSegmentHover={s => setHoveredGen(s?.label ?? null)}
                  centerContent={
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontFamily: MONO, color: T.textPrimary }}>{n(genTotal)}</div>
                      <div style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS }}>contactos</div>
                    </div>
                  } />
                <DonutLegend data={genDonutData} total={genTotal} hoveredLabel={hoveredGen} onHover={setHoveredGen} />
              </>
            )}
          </div>
        </div>
      )}

      {tab === "modelo" && (
        <div>
          <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, marginBottom: 14 }}>
            Modelos de interés ({modelos.length} modelos)
          </div>
          {modelos.length === 0
            ? <div style={{ fontSize: 12, color: T.textGhost, fontFamily: SANS }}>Sin datos de modelos</div>
            : <SortableTable data={modelos} maxHeight={420} searchable accentColor={T.amber} showRank />}
        </div>
      )}

      {tab === "capacidad" && <CapacidadPanel capacidad={capacidad} />}
    </Panel>
  );
}

// ── Capacidad bancaria ────────────────────────────────────────────────
function CapacidadPanel({ capacidad }: { capacidad: Analytics["capacidad"] }) {
  if (!capacidad) return <div style={{ fontSize: 12, color: T.textGhost, fontFamily: SANS, padding: "24px 0" }}>Sin datos de capacidad bancaria</div>;
  const rangos   = [...(capacidad.rangos ?? [])].sort((a, b) => a.orden - b.orden);
  const maxR     = Math.max(...rangos.map(r => r.count), 1);
  const totalCap = rangos.reduce((s, r) => s + r.count, 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "Promedio", value: fmtMXN(capacidad.promedio) }, { label: "Mediana", value: fmtMXN(capacidad.mediana) }, { label: "P25", value: fmtMXN(capacidad.p25) }, { label: "P75", value: fmtMXN(capacidad.p75) }].map(({ label, value }) => (
            <div key={label} style={{ background: T.bgSubtle, borderRadius: T.radiusMd, border: `0.5px solid ${T.borderFaint}`, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: T.textGhost, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: SANS, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 16, fontFamily: MONO, color: T.textPrimary, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.textGhost, fontFamily: SANS }}>{n(capacidad.con_dato)} contactos con dato de capacidad</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rangos.map(({ label, count }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: T.textSecondary, fontFamily: SANS }}>{label}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, fontFamily: MONO, color: T.textSecondary }}>{n(count)}</span>
                <span style={{ fontSize: 10, fontFamily: MONO, color: T.textMuted, width: 44, textAlign: "right" }}>{pctStr(count, totalCap)}</span>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(count / maxR) * 100}%`, background: `linear-gradient(90deg, ${T.amber}, ${T.amber}88)`, borderRadius: 4, opacity: 0.85, transition: "width 0.3s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desarrollos + Origen ──────────────────────────────────────────────
function DesarrollosSection({ analytics }: { analytics: Analytics }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      <Panel>
        <PanelHeader title="Desarrollos" badge={`${analytics.by_desarrollo?.length ?? 0} proyectos`} />
        <SortableTable data={analytics.by_desarrollo ?? []} maxHeight={420} accentColor={T.purple} showRank />
      </Panel>
      <Panel>
        <PanelHeader title="Origen del contacto" badge={`${analytics.by_source_label?.length ?? 0} fuentes`} />
        <SortableTable data={analytics.by_source_label ?? []} maxHeight={420} accentColor={T.blue} />
      </Panel>
    </div>
  );
}

// ── UTMs ──────────────────────────────────────────────────────────────
function UtmSection({ analytics }: { analytics: Analytics }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      <Panel>
        <PanelHeader title="UTM Source" badge={`${analytics.by_utm_source?.length ?? 0} fuentes`} />
        <SortableTable data={analytics.by_utm_source ?? []} maxHeight={420} searchable accentColor={T.blue} />
      </Panel>
      <Panel>
        <PanelHeader title="UTM Campaign" badge={`${analytics.by_utm_campaign?.length ?? 0} campañas`} />
        <SortableTable data={analytics.by_utm_campaign ?? []} maxHeight={420} searchable accentColor={T.teal} />
      </Panel>
    </div>
  );
}

// ── Syncing screen ────────────────────────────────────────────────────
function SyncingScreen({ sync }: { sync: SyncStatus | null }) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <Panel>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${T.borderDefault}`, borderTopColor: T.orange, animation: "spin 0.9s linear infinite" }} />
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: T.textPrimary, fontFamily: SANS }}>Sincronizando base de datos{dots}</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: T.textMuted, fontFamily: SANS }}>
            {sync ? `${n(sync.total_contacts)} contactos procesados` : "Cargando estado..."} — los datos aparecerán al terminar
          </p>
        </div>
        <div style={{ padding: "10px 18px", borderRadius: T.radiusMd, background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}` }}>
          <p style={{ margin: 0, fontSize: 11, color: T.textGhost, fontFamily: SANS }}>La página se actualiza automáticamente cada 30 segundos</p>
        </div>
      </div>
    </Panel>
  );
}

// ── Dropdown desarrollo ───────────────────────────────────────────────
function DesarrolloSelect({ desarrollos, value, onChange }: { desarrollos: Item[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: "none", WebkitAppearance: "none", background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusMd, color: T.textPrimary, fontSize: 12, fontWeight: 500, fontFamily: SANS, padding: "7px 32px 7px 12px", cursor: "pointer", outline: "none", minWidth: 200 }}>
        <option value="">Todos los desarrollos</option>
        {desarrollos.filter(d => d.label !== "Sin asignar").sort((a, b) => a.label.localeCompare(b.label, "es")).map(d => (
          <option key={d.label} value={d.label}>{d.label} ({n(d.count)})</option>
        ))}
      </select>
      <ChevronDownIcon size={12} color={T.textMuted} style={{ position: "absolute", right: 10, pointerEvents: "none" }} />
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [a,         setA]         = useState<Analytics | null>(null);
  const [all,       setAll]       = useState<Analytics | null>(null);
  const [geo,       setGeo]       = useState<GeoData | null>(null);
  const [sync,      setSync]      = useState<SyncStatus | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [period,    setPeriod]    = useState<Period>("ALL");
  const [des,       setDes]       = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGeo = useCallback(async () => {
    try {
      const json = await fetch("/api/integrations/hubspot/geo", { signal: AbortSignal.timeout(8000) }).then(r => r.json());
      if (json.ok && json.data) setGeo(json.data);
    } catch { /* geo es opcional */ }
  }, []);

  const fetchData = useCallback(async (p: Period, desarrollo: string, cfrom: string, cto: string, showSkeleton: boolean) => {
    if (showSkeleton) setLoading(true);
    try {
      const params = new URLSearchParams();
      const { from, to } = periodToParams(p, cfrom, cto);
      if (from) params.set("from", from);
      if (to)   params.set("to", to);
      if (desarrollo) params.set("desarrollo", desarrollo);
      const qs   = params.size ? "?" + params.toString() : "";
      const json = await fetch(`/api/integrations/hubspot/clientes${qs}`, { signal: AbortSignal.timeout(10000) }).then(r => r.json());
      setSync(json.syncStatus ?? null);
      if (json.ok && json.analytics) {
        setA(json.analytics);
        setIsSyncing(false);
        if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
        if (p === "ALL" && !desarrollo) setAll(json.analytics);
      } else {
        setIsSyncing(true);
        if (!retryRef.current) {
          retryRef.current = setTimeout(() => { retryRef.current = null; fetchData(p, desarrollo, cfrom, cto, false); }, 30_000);
        }
      }
    } catch {
      setIsSyncing(true);
      if (!retryRef.current) {
        retryRef.current = setTimeout(() => { retryRef.current = null; fetchData(p, des, cfrom, cto, false); }, 30_000);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { return () => { if (retryRef.current) clearTimeout(retryRef.current); }; }, []);
  useEffect(() => { fetchData("ALL", "", "", "", true); fetchGeo(); }, [fetchData, fetchGeo]);

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    setShowDatePicker(false);
    fetchData(p, des, customFrom, customTo, true);
  };

  const handleDesarrollo = (v: string) => {
    setDes(v);
    fetchData(period, v, customFrom, customTo, false);
  };

  const handleCustomApply = () => {
    if (!customFrom) return;
    setPeriod("CUSTOM");
    setShowDatePicker(false);
    fetchData("CUSTOM", des, customFrom, customTo, true);
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: -800px 0 } 100% { background-position: 800px 0 } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        select option { background: #1a1d27; }
        .date-input::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
      `}</style>

      <div style={{ background: T.bgCanvas, minHeight: "100vh", padding: "24px 28px 80px", fontFamily: SANS }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: T.textPrimary, letterSpacing: "-0.02em", fontFamily: SANS }}>
                Inteligencia de Audiencias
              </h1>
              {des && (
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: T.radiusSm, background: T.orangeBg, color: T.orange, border: `0.5px solid ${T.orangeBd}`, fontFamily: SANS }}>
                  {des}
                </span>
              )}
              {period === "CUSTOM" && customFrom && (
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: T.radiusSm, background: T.tealBg, color: T.teal, border: `0.5px solid ${T.teal}44`, fontFamily: SANS, display: "flex", alignItems: "center", gap: 4 }}>
                  <CalendarIcon size={10} /> {customFrom} → {customTo || "hoy"}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isSyncing ? T.amber : T.teal, animation: "pulse-dot 2s ease-in-out infinite" }} />
              <p style={{ margin: 0, fontSize: 12, color: T.textMuted, fontFamily: SANS }}>
                {a ? `${n(a.total_contactos)} contactos · Actualizado ${fmtDate(sync?.last_sync_at ?? null)}`
                   : isSyncing ? `Sincronizando${sync ? ` · ${n(sync.total_contacts)} procesados` : ""}...`
                   : "Conectando..."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {/* Preset period buttons */}
            {(["7D", "30D", "90D", "YTD", "ALL"] as const).map(r => (
              <button key={r} onClick={() => handlePeriod(r)} style={{
                padding: "5px 10px", borderRadius: T.radiusSm, border: "none",
                background: period === r ? T.orangeBg : "transparent",
                color: period === r ? T.orange : T.textMuted,
                fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: SANS,
                borderWidth: "0.5px", borderStyle: "solid",
                borderColor: period === r ? T.orangeBd : T.borderFaint,
                transition: "all 150ms",
              }}>{r}</button>
            ))}

            {/* Custom date range */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDatePicker(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 10px", borderRadius: T.radiusSm,
                  background: period === "CUSTOM" ? T.tealBg : "transparent",
                  color: period === "CUSTOM" ? T.teal : T.textMuted,
                  fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: SANS,
                  borderWidth: "0.5px", borderStyle: "solid",
                  borderColor: period === "CUSTOM" ? T.teal + "44" : T.borderFaint,
                  transition: "all 150ms",
                }}>
                <CalendarIcon size={11} /> Rango
              </button>
              {showDatePicker && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 100, background: T.bgOverlay, border: `0.5px solid ${T.borderEmphasis}`, borderRadius: T.radiusMd, padding: "14px 16px", boxShadow: T.shadowFloat, minWidth: 280 }}>
                  <div style={{ fontSize: 9, color: T.textGhost, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: SANS, marginBottom: 10 }}>Rango personalizado</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {[
                      { label: "Desde", val: customFrom, set: setCustomFrom },
                      { label: "Hasta", val: customTo, set: setCustomTo },
                    ].map(({ label, val, set }) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, color: T.textGhost, fontFamily: SANS, marginBottom: 4 }}>{label}</div>
                        <input type="date" value={val} onChange={e => set(e.target.value)}
                          className="date-input"
                          style={{ background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusSm, color: T.textPrimary, fontSize: 11, fontFamily: SANS, padding: "6px 8px", width: "100%", outline: "none" }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={handleCustomApply} disabled={!customFrom}
                      style={{ flex: 1, padding: "6px 12px", borderRadius: T.radiusSm, border: "none", background: customFrom ? T.teal : T.bgSubtle, color: customFrom ? "white" : T.textGhost, fontSize: 11, fontWeight: 500, cursor: customFrom ? "pointer" : "default", fontFamily: SANS, transition: "all 150ms" }}>
                      Aplicar
                    </button>
                    <button onClick={() => { setCustomFrom(""); setCustomTo(""); setShowDatePicker(false); handlePeriod("ALL"); }}
                      style={{ padding: "6px 10px", borderRadius: T.radiusSm, border: `0.5px solid ${T.borderFaint}`, background: "transparent", color: T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: SANS }}>
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desarrollo dropdown */}
            {all?.by_desarrollo && all.by_desarrollo.length > 0 && (
              <DesarrolloSelect desarrollos={all.by_desarrollo} value={des} onChange={handleDesarrollo} />
            )}
            {des && (
              <button onClick={() => handleDesarrollo("")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: T.radiusSm, background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, color: T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: SANS }}>
                <XIcon size={11} /> Limpiar
              </button>
            )}
          </div>
        </div>

        {/* ── Sync banner ─────────────────────────────────────── */}
        {!loading && isSyncing && a && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: T.radiusMd, marginBottom: 16, background: T.amberBg, border: `0.5px solid ${T.amber}44` }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${T.amber}`, borderTopColor: "transparent", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: T.amber, fontFamily: SANS }}>Sincronización en progreso — mostrando últimos datos disponibles. Actualizando en 30 s.</span>
          </div>
        )}

        {/* ── Syncing (sin datos) ──────────────────────────────── */}
        {!loading && isSyncing && !a && <SyncingScreen sync={sync} />}

        {/* ── Loading skeleton ─────────────────────────────────── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.bgSubtle, border: `0.5px solid ${T.borderDefault}`, borderRadius: T.radiusLg, padding: "14px 22px", display: "flex", gap: 16 }}>
              {[0,1,2,3,4,5,6,7].map(i => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <Skel h={9} w="70%" /><Skel h={15} w="50%" />
                </div>
              ))}
            </div>
            <SkeletonPanel rows={8} />
            <SkeletonPanel rows={5} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <SkeletonPanel rows={7} /><SkeletonPanel rows={7} />
            </div>
          </div>
        )}

        {/* ── Main content ─────────────────────────────────────── */}
        {!loading && a && (() => {
          const { from: tFrom, to: tTo } = periodToParams(period, customFrom, customTo);
          const periodLabel =
            period === "7D"     ? "Últimos 7 días"
            : period === "30D"  ? "Últimos 30 días"
            : period === "90D"  ? "Últimos 90 días"
            : period === "YTD"  ? "Año en curso"
            : period === "CUSTOM" && customFrom
              ? `${customFrom}${customTo ? " → " + customTo : ""}`
            : "Todo el historial";
          return (
            <>
              <MetricsBar analytics={a} />
              <FunnelSection analytics={a} />
              <TrendSection
                data={a.contactos_por_mes ?? []}
                globalFrom={tFrom}
                globalTo={tTo}
                periodLabel={periodLabel}
              />
              <CanalesPanel analytics={a} />
              <GeoSection analytics={a} geo={geo} />
              <AudienciasSection analytics={a} />
              <DesarrollosSection analytics={a} />
              <UtmSection analytics={a} />
            </>
          );
        })()}
      </div>
    </>
  );
}
