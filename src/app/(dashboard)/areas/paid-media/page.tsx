"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, Tooltip as RTooltip,
  ResponsiveContainer, Cell, BarChart, Bar,
} from "recharts";
import {
  TargetIcon, TrendingUpIcon, ZapIcon, EyeIcon,
  ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon,
  PlugIcon, ExternalLinkIcon,
} from "lucide-react";
import { T } from "@/styles/tokens";
import { DonutChart, DonutLegend, type DonutSegment } from "@/components/ui/donut-chart";
import { PanelHeader } from "@/components/ui/panel-header";

// ── Fonts ──────────────────────────────────────────────────────────────
const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// ── Helpers ────────────────────────────────────────────────────────────
const n = (v: number) => v.toLocaleString("es-MX");
const mxn = (v: number) => `$${n(v)}`;
const cpl = (v: number) => `$${n(v)}`;

// ── Types ──────────────────────────────────────────────────────────────
type Period = "7D" | "30D" | "90D" | "Todo";
type SortKey = "presupuesto" | "leads" | "cpl" | "impresiones" | null;
type SortDir = "asc" | "desc";
type Platform = "Meta" | "Google" | "TikTok";
type Status = "activa" | "pausada";

interface Campaign {
  nombre: string;
  desarrollo: string;
  plataforma: Platform;
  presupuesto: number;
  leads: number;
  cpl: number;
  impresiones: number;
  estado: Status;
}

// ── Demo Data ──────────────────────────────────────────────────────────
const CAMPAIGNS: Campaign[] = [
  { nombre: "AUKENA · Awareness Caribe",      desarrollo: "Aukena",                  plataforma: "Meta",   presupuesto: 48000, leads: 287, cpl: 167, impresiones: 892000,  estado: "activa"  },
  { nombre: "Turquesa PDC · Conversión",       desarrollo: "Turquesa",               plataforma: "Meta",   presupuesto: 32000, leads: 198, cpl: 162, impresiones: 623000,  estado: "activa"  },
  { nombre: "Bonza QRO · Lead Gen",            desarrollo: "Bonza",                  plataforma: "Meta",   presupuesto: 24000, leads: 156, cpl: 154, impresiones: 481000,  estado: "activa"  },
  { nombre: "Meriden Mérida · Retargeting",    desarrollo: "Meriden",                plataforma: "Google", presupuesto: 18500, leads: 142, cpl: 130, impresiones: 412000,  estado: "activa"  },
  { nombre: "Central Park · Premium Search",   desarrollo: "Central Park Bosque Real", plataforma: "Google", presupuesto: 14200, leads: 89, cpl: 160, impresiones: 234000,  estado: "activa"  },
  { nombre: "Trojes Puebla · TikTok",          desarrollo: "Trojes",                 plataforma: "TikTok", presupuesto: 10500, leads: 62, cpl: 169, impresiones: 205000,  estado: "pausada" },
];

// 30-day spend trend with realistic variation
const SPEND_SEED = [
  4820, 5110, 4650, 5340, 5800, 4990, 4430,
  5270, 5620, 5080, 4760, 5410, 5930, 4880,
  5150, 5680, 4500, 5220, 5750, 4970,
  5380, 5090, 4640, 5510, 5820, 4780, 5200,
  5640, 4910, 5300,
];
const SPEND_DATA = SPEND_SEED.map((gasto, i) => {
  const day = i + 1;
  const label = day <= 9 ? `May ${day}` : day <= 22 ? `May ${day}` : `May ${day}`;
  return { dia: label, gasto };
});

const PLATFORM_DATA: DonutSegment[] = [
  { label: "Meta",   value: 68, color: T.blue   },
  { label: "Google", value: 22, color: T.teal   },
  { label: "TikTok", value: 10, color: T.purple },
];

const REGION_DATA = [
  { region: "Quintana Roo",   pct: 54 },
  { region: "Edo. de México", pct: 18 },
  { region: "Querétaro",      pct: 16 },
  { region: "Yucatán",        pct: 12 },
];

const REGION_COLORS = [T.orange, T.blue, T.teal, T.purple];

// ── Period filter multipliers (for KPI display) ────────────────────────
const PERIOD_FACTOR: Record<Period, number> = {
  "7D": 0.23, "30D": 1, "90D": 2.7, "Todo": 4.1,
};

// ── Platform badge ─────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: Platform }) {
  const map: Record<Platform, { bg: string; color: string }> = {
    Meta:   { bg: `${T.blue}1a`,   color: T.blue   },
    Google: { bg: `${T.teal}1a`,   color: T.teal   },
    TikTok: { bg: `${T.purple}1a`, color: T.purple },
  };
  const s = map[platform];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, fontFamily: SANS,
      border: `0.5px solid ${s.color}33`,
      letterSpacing: "0.01em",
    }}>
      {platform}
    </span>
  );
}

// ── Status badge ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; color: string; dot: string }> = {
    activa:  { bg: `${T.teal}15`,  color: T.teal,  dot: T.teal  },
    pausada: { bg: `${T.amber}15`, color: T.amber, dot: T.amber },
  };
  const s = map[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, fontFamily: SANS,
      border: `0.5px solid ${s.color}33`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: s.color,
        ...(status === "activa" ? { boxShadow: `0 0 6px ${s.dot}` } : {}),
      }} />
      {status === "activa" ? "Activa" : "Pausada"}
    </span>
  );
}

// ── Period pill ────────────────────────────────────────────────────────
function PeriodPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 30, padding: "0 12px",
        background: active ? T.orange : "transparent",
        border: active ? "none" : `1px solid ${T.borderDefault}`,
        borderRadius: 20,
        color: active ? "#fff" : T.textSecondary,
        fontSize: 12, fontWeight: 600, fontFamily: SANS,
        cursor: "pointer",
        transition: "all 150ms ease",
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </button>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────
function SpendTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(12,12,14,0.96)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      borderRadius: T.radiusMd,
      padding: "8px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    }}>
      <div style={{ color: T.textMuted, fontSize: 10, fontFamily: SANS, marginBottom: 4 }}>{label}</div>
      <div style={{ color: T.textPrimary, fontSize: 13, fontFamily: MONO, fontWeight: 500 }}>
        {mxn(payload[0].value)}
      </div>
    </div>
  );
}

// ── Sort icon ──────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ArrowUpDownIcon size={11} color={T.textGhost} />;
  return sortDir === "asc"
    ? <ArrowUpIcon size={11} color={T.orange} />
    : <ArrowDownIcon size={11} color={T.orange} />;
}

// ══════════════════════════════════════════════════════════════════════
export default function PaidMediaPage() {
  const [period, setPeriod] = useState<Period>("30D");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const factor = PERIOD_FACTOR[period];

  // KPI values scaled by period factor
  const kpis = useMemo(() => ({
    inversion:  Math.round(147200  * factor),
    leads:      Math.round(934     * factor),
    cplVal:     Math.round(157     * (0.9 + factor * 0.05)), // slight variation
    roas:       parseFloat((2.8 + (factor - 1) * 0.08).toFixed(1)),
    campanas:   6,
    impresiones: Math.round(2847000 * factor),
  }), [factor]);

  // Sorted campaigns
  const sortedCampaigns = useMemo(() => {
    if (!sortKey) return CAMPAIGNS;
    return [...CAMPAIGNS].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const PERIODS: Period[] = ["7D", "30D", "90D", "Todo"];

  return (
    <div style={{
      padding: "32px 40px 60px",
      maxWidth: 1200,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 28,
      fontFamily: SANS,
    }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{
            margin: 0, color: T.textPrimary,
            fontSize: 26, fontWeight: 700,
            letterSpacing: "-0.025em", fontFamily: SANS,
          }}>
            Paid Media
          </h1>
          <p style={{ margin: "5px 0 0", color: T.textSecondary, fontSize: 13, fontFamily: SANS }}>
            Meta Ads · Google Ads · TikTok Ads — datos demostrativos
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map(p => (
            <PeriodPill key={p} label={p} active={period === p} onClick={() => setPeriod(p)} />
          ))}
        </div>
      </div>

      {/* ── KPI Bar ─────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        background: T.bgPanel,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: T.radiusLg,
        overflow: "hidden",
      }}>
        {[
          { label: "Inversión total",   value: mxn(kpis.inversion),          icon: <TrendingUpIcon size={14} />, color: T.orange  },
          { label: "Leads totales",      value: n(kpis.leads),                icon: <TargetIcon size={14} />,     color: T.teal    },
          { label: "CPL promedio",       value: cpl(kpis.cplVal),             icon: <ZapIcon size={14} />,        color: T.blue    },
          { label: "ROAS",               value: `${kpis.roas}x`,              icon: <TrendingUpIcon size={14} />, color: T.purple  },
          { label: "Campañas activas",   value: String(kpis.campanas),        icon: <TargetIcon size={14} />,     color: T.amber   },
          { label: "Impresiones",        value: n(kpis.impresiones),          icon: <EyeIcon size={14} />,        color: T.textMuted },
        ].map((kpi, i, arr) => (
          <div
            key={kpi.label}
            style={{
              padding: "20px 20px",
              borderRight: i < arr.length - 1 ? `1px solid ${T.borderDefault}` : "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: kpi.color }}>
              {kpi.icon}
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: SANS, color: T.textMuted }}>
                {kpi.label}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: MONO, color: T.textPrimary, letterSpacing: "-0.02em" }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>

        {/* Spend Trend */}
        <div style={{
          background: T.bgPanel,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.radiusLg,
          padding: "20px 24px 16px",
        }}>
          <PanelHeader title="Inversión diaria" badge="últimos 30 días" />
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPEND_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={T.orange} stopOpacity={0.30} />
                    <stop offset="100%" stopColor={T.orange} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 10, fill: T.textMuted, fontFamily: MONO }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <RTooltip content={<SpendTooltip />} cursor={{ stroke: T.borderEmphasis, strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="gasto"
                  stroke={T.orange}
                  strokeWidth={2}
                  fill="url(#spendGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: T.orange, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div style={{
          background: T.bgPanel,
          border: `1px solid ${T.borderDefault}`,
          borderRadius: T.radiusLg,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          <PanelHeader title="Por plataforma" badge="% inversión" />
          <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
            <DonutChart
              data={PLATFORM_DATA}
              size={120}
              strokeWidth={16}
              onSegmentHover={seg => setHoveredPlatform(seg?.label ?? null)}
              centerContent={
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontFamily: MONO, fontWeight: 600, color: T.textPrimary }}>
                    {hoveredPlatform
                      ? `${PLATFORM_DATA.find(d => d.label === hoveredPlatform)?.value ?? 0}%`
                      : "100%"}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: SANS, color: T.textMuted, marginTop: 2 }}>
                    {hoveredPlatform ?? "Total"}
                  </div>
                </div>
              }
            />
            <div style={{ flex: 1 }}>
              <DonutLegend
                data={PLATFORM_DATA}
                total={100}
                hoveredLabel={hoveredPlatform}
                onHover={setHoveredPlatform}
              />
            </div>
          </div>

          {/* Region mini bars */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, fontFamily: SANS, marginBottom: 10 }}>
              Por región
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {REGION_DATA.map((r, i) => (
                <div key={r.region}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontFamily: SANS, color: T.textSecondary }}>{r.region}</span>
                    <span style={{ fontSize: 11, fontFamily: MONO, color: T.textMuted }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: T.bgSubtle, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${r.pct}%`,
                      background: REGION_COLORS[i],
                      borderRadius: 2,
                      transition: "width 600ms ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaigns Table ──────────────────────────────────────────── */}
      <div style={{
        background: T.bgPanel,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: T.radiusLg,
        overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px 0" }}>
          <PanelHeader
            title="Campañas activas"
            badge={String(CAMPAIGNS.length)}
            action={
              <span style={{ fontSize: 11, color: T.textMuted, fontFamily: MONO }}>
                {n(kpis.leads)} leads · {period}
              </span>
            }
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "8%"  }} />
              <col style={{ width: "9%"  }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "6%"  }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.borderFaint}` }}>
                {[
                  { label: "Campaña",      key: null              },
                  { label: "Desarrollo",   key: null              },
                  { label: "Plataforma",   key: null              },
                  { label: "Presupuesto",  key: "presupuesto" as SortKey },
                  { label: "Leads",        key: "leads"      as SortKey },
                  { label: "CPL",          key: "cpl"        as SortKey },
                  { label: "Impresiones",  key: "impresiones" as SortKey },
                  { label: "Estado",       key: null              },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={() => col.key && handleSort(col.key)}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: sortKey === col.key ? T.orange : T.textMuted,
                      fontFamily: SANS,
                      cursor: col.key ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {col.label}
                      {col.key && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((c, i) => {
                const isHovered = hoveredRow === i;
                return (
                  <tr
                    key={c.nombre}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: i < sortedCampaigns.length - 1 ? `1px solid ${T.borderFaint}` : "none",
                      background: isHovered ? T.bgSubtle : "transparent",
                      transition: "background 120ms ease",
                    }}
                  >
                    {/* Campaña */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isHovered ? T.textPrimary : T.textSecondary,
                        fontFamily: SANS,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        transition: "color 120ms",
                      }}>
                        {c.nombre}
                      </span>
                    </td>
                    {/* Desarrollo */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        fontSize: 12, color: T.textSecondary, fontFamily: SANS,
                        display: "block", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {c.desarrollo}
                      </span>
                    </td>
                    {/* Plataforma */}
                    <td style={{ padding: "13px 16px" }}>
                      <PlatformBadge platform={c.plataforma} />
                    </td>
                    {/* Presupuesto */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 13, fontFamily: MONO, color: T.textPrimary }}>
                        {mxn(c.presupuesto)}
                      </span>
                    </td>
                    {/* Leads */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 13, fontFamily: MONO, color: T.teal, fontWeight: 600 }}>
                        {n(c.leads)}
                      </span>
                    </td>
                    {/* CPL */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 13, fontFamily: MONO, color: T.textPrimary }}>
                        {cpl(c.cpl)}
                      </span>
                    </td>
                    {/* Impresiones */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 12, fontFamily: MONO, color: T.textSecondary }}>
                        {n(c.impresiones)}
                      </span>
                    </td>
                    {/* Estado */}
                    <td style={{ padding: "13px 16px" }}>
                      <StatusBadge status={c.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Connection Banner ────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: T.bgPanel,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: T.radiusLg,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: T.bgSubtle,
          border: `1px solid ${T.borderEmphasis}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <PlugIcon size={15} color={T.orange} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: SANS }}>
            Conecta Meta Ads para sincronizar campañas en tiempo real
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, fontFamily: SANS, marginTop: 2 }}>
            Activa la integración con Meta Business para ver presupuesto ejecutado, performance y audiencias actualizados automáticamente.
          </div>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          height: 32, padding: "0 14px",
          background: T.bgSubtle,
          border: `1px solid ${T.borderEmphasis}`,
          borderRadius: T.radiusMd,
          color: T.textSecondary,
          fontSize: 12, fontWeight: 500, fontFamily: SANS,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 150ms, color 150ms",
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = T.orange;
            (e.currentTarget as HTMLButtonElement).style.color = T.textPrimary;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderEmphasis;
            (e.currentTarget as HTMLButtonElement).style.color = T.textSecondary;
          }}
        >
          <ExternalLinkIcon size={12} />
          Conectar
        </button>
      </div>

    </div>
  );
}
