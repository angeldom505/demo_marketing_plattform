"use client";

import React, { useState } from "react";
import { T } from "@/styles/tokens";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrendingUpIcon,
  ArrowRightIcon,
  EyeIcon,
  HeartIcon,
  BarChart2Icon,
  Share2Icon,
} from "lucide-react";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

// Platform config
const PLATFORMS = {
  IG: { label: "IG", color: "#E4405F", bg: "rgba(228,64,95,0.12)" },
  FB: { label: "FB", color: "#1877F2", bg: "rgba(24,119,242,0.12)" },
  TK: { label: "TK", color: "#69C9D0", bg: "rgba(105,201,208,0.12)" },
  "IG Story": { label: "Story", color: "#E4405F", bg: "rgba(228,64,95,0.08)" },
} as const;

type Platform = keyof typeof PLATFORMS;
type Status = "publicado" | "programado" | "borrador";

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  publicado: { label: "Publicado", color: T.teal, bg: "rgba(29,158,117,0.12)" },
  programado: { label: "Programado", color: T.blue, bg: "rgba(74,144,217,0.12)" },
  borrador:   { label: "Borrador",   color: T.amber, bg: "rgba(196,127,26,0.12)" },
};

interface Post {
  platform: Platform;
  desarrollo: string;
  copy: string;
  status: Status;
  likes?: number;
  views?: number;
  engagement?: string;
}

// Week data: index 0 = Monday (19 May 2026)
const WEEK_POSTS: Post[][] = [
  // Monday
  [
    { platform: "IG", desarrollo: "Aukena", copy: "El Caribe no es destino. Es tu dirección.", status: "publicado", likes: 847, engagement: "12.4%" },
    { platform: "FB", desarrollo: "Trojes", copy: "Encuentra tu espacio en Puebla.", status: "publicado", likes: 234 },
  ],
  // Tuesday
  [
    { platform: "IG", desarrollo: "Turquesa", copy: "Playa del Carmen a minutos de casa.", status: "publicado", likes: 1243, engagement: "18.7%" },
    { platform: "TK", desarrollo: "Aukena", copy: "POV: despertar con vista al Caribe 🌊", status: "publicado", views: 24700 },
  ],
  // Wednesday
  [
    { platform: "IG", desarrollo: "Bonza", copy: "Querétaro tiene todo lo que buscas.", status: "programado" },
    { platform: "FB", desarrollo: "Meriden", copy: "Mérida Norte: donde vive el futuro.", status: "programado" },
    { platform: "IG Story", desarrollo: "Aukena", copy: "Tour virtual disponible 🏠", status: "programado" },
  ],
  // Thursday
  [
    { platform: "IG", desarrollo: "Central Park", copy: "Huixquilucan redefinido.", status: "programado" },
    { platform: "TK", desarrollo: "Turquesa", copy: "Así se ve vivir en Playa del Carmen 🌴", status: "programado" },
  ],
  // Friday
  [
    { platform: "IG", desarrollo: "Aukena", copy: "Unidades limitadas. Pregunta por disponibilidad.", status: "borrador" },
    { platform: "FB", desarrollo: "Bonza", copy: "¿Listo para tu primer hogar en QRO?", status: "borrador" },
  ],
  // Saturday
  [
    { platform: "IG", desarrollo: "Trojes", copy: "Fin de semana con espacio para crecer.", status: "programado" },
  ],
  // Sunday
  [],
];

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_DATES_MAY = [19, 20, 21, 22, 23, 24, 25];

const WEEK_LABELS = [
  "12–18 May 2026",
  "19–25 May 2026",
  "26 May–1 Jun 2026",
];

const TODAY_WEEKDAY = 5; // Saturday (0-indexed: 0=Mon … 6=Sun) — May 23 is Saturday

function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = PLATFORMS[platform];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "1px 6px",
        borderRadius: 4,
        background: cfg.bg,
        color: cfg.color,
        fontSize: 10,
        fontFamily: MONO,
        fontWeight: 600,
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 6px",
        borderRadius: 4,
        background: cfg.bg,
        color: cfg.color,
        fontSize: 10,
        fontFamily: MONO,
        fontWeight: 600,
        letterSpacing: "0.03em",
        flexShrink: 0,
      }}
    >
      {cfg.label}
    </span>
  );
}

function PostChip({ post }: { post: Post }) {
  const borderColor =
    post.status === "publicado"
      ? T.teal
      : post.status === "programado"
      ? T.blue
      : T.amber;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "7px 9px",
        borderRadius: T.radiusMd,
        background: T.bgOverlay,
        border: `1px solid ${T.borderDefault}`,
        borderLeft: `3px solid ${borderColor}`,
        cursor: "pointer",
        transition: "background 0.15s",
        minHeight: 62,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = T.bgOverlay;
      }}
    >
      {/* Top row: platform + desarrollo */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        <PlatformBadge platform={post.platform} />
        <span
          style={{
            fontSize: 10,
            fontFamily: SANS,
            fontWeight: 600,
            color: T.textSecondary,
            letterSpacing: "0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 80,
          }}
        >
          {post.desarrollo}
        </span>
      </div>

      {/* Copy snippet */}
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontFamily: SANS,
          color: T.textPrimary,
          lineHeight: 1.4,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          flex: 1,
        }}
      >
        {post.copy}
      </p>

      {/* Bottom row: status + metrics */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <StatusBadge status={post.status} />
        {post.likes !== undefined && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontFamily: MONO,
              color: T.textMuted,
            }}
          >
            <HeartIcon size={9} />
            {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
            {post.engagement && (
              <span style={{ color: T.teal, marginLeft: 2 }}>{post.engagement}</span>
            )}
          </span>
        )}
        {post.views !== undefined && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 10,
              fontFamily: MONO,
              color: T.textMuted,
            }}
          >
            <EyeIcon size={9} />
            {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
          </span>
        )}
      </div>
    </div>
  );
}

function AddButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "6px 0",
        borderRadius: T.radiusMd,
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        border: `1px dashed ${hovered ? T.borderEmphasis : T.borderFaint}`,
        color: hovered ? T.textSecondary : T.textGhost,
        cursor: "pointer",
        transition: "all 0.15s",
        gap: 4,
        fontSize: 11,
        fontFamily: SANS,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <PlusIcon size={12} />
      Añadir
    </button>
  );
}

type PlatformFilter = "Todas" | "Instagram" | "Facebook" | "TikTok";

const PLATFORM_FILTER_MAP: Record<PlatformFilter, Platform[] | null> = {
  Todas: null,
  Instagram: ["IG", "IG Story"],
  Facebook: ["FB"],
  TikTok: ["TK"],
};

function filterPosts(posts: Post[], filter: PlatformFilter): Post[] {
  const allowed = PLATFORM_FILTER_MAP[filter];
  if (!allowed) return posts;
  return posts.filter((p) => allowed.includes(p.platform));
}

// KPI chip
function KPIChip({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: T.radiusMd,
        background: T.bgSubtle,
        border: `1px solid ${T.borderDefault}`,
      }}
    >
      <span style={{ fontSize: 12, fontFamily: MONO, fontWeight: 700, color: color ?? T.textPrimary }}>
        {value}
      </span>
      <span style={{ fontSize: 11, fontFamily: SANS, color: T.textSecondary }}>{label}</span>
    </div>
  );
}

// Metrics card
function MetricCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 130,
        padding: "16px 18px",
        borderRadius: T.radiusLg,
        background: T.bgPanel,
        border: `1px solid ${T.borderDefault}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color: color ?? T.textSecondary }}>{icon}</span>
        <span style={{ fontSize: 11, fontFamily: SANS, color: T.textSecondary }}>{label}</span>
      </div>
      <span style={{ fontSize: 20, fontFamily: MONO, fontWeight: 700, color: color ?? T.textPrimary, letterSpacing: "-0.02em" }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 10, fontFamily: SANS, color: T.textMuted, lineHeight: 1.4 }}>
          {sub}
        </span>
      )}
    </div>
  );
}

export default function SocialMediaPage() {
  const [weekOffset, setWeekOffset] = useState(1); // 1 = current week (19-25 May)
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("Todas");

  const weekLabel = WEEK_LABELS[weekOffset] ?? WEEK_LABELS[1];
  const isCurrentWeek = weekOffset === 1;

  const PLATFORM_FILTERS: PlatformFilter[] = ["Todas", "Instagram", "Facebook", "TikTok"];

  return (
    <div
      style={{
        padding: "32px 40px 64px",
        maxWidth: 1340,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        fontFamily: SANS,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: T.textPrimary,
                letterSpacing: "-0.025em",
                fontFamily: SANS,
              }}
            >
              Social Media
            </h1>
            <span
              style={{
                fontSize: 13,
                color: T.textMuted,
                fontFamily: SANS,
              }}
            >
              Parrilla editorial
            </span>
          </div>
          {/* KPI chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <KPIChip value={8} label="posts esta semana" />
            <KPIChip value={3} label="publicados" color={T.teal} />
            <KPIChip value={4} label="programados" color={T.blue} />
            <KPIChip value={1} label="borrador" color={T.amber} />
          </div>
        </div>

        {/* Quick action */}
        <a
          href="/areas/contenido"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            borderRadius: T.radiusMd,
            background: T.orange,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: SANS,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
        >
          Nueva pieza
          <ArrowRightIcon size={14} />
        </a>
      </div>

      {/* ── Week navigation ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* Prev / label / Next */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: T.radiusMd,
              background: T.bgSubtle,
              border: `1px solid ${T.borderDefault}`,
              color: weekOffset === 0 ? T.textGhost : T.textSecondary,
              fontSize: 12,
              fontFamily: SANS,
              fontWeight: 500,
              cursor: weekOffset === 0 ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            <ChevronLeftIcon size={14} />
            Sem. anterior
          </button>

          <div
            style={{
              padding: "6px 20px",
              borderRadius: T.radiusMd,
              background: T.bgSubtle,
              border: `1px solid ${T.borderEmphasis}`,
              fontSize: 13,
              fontFamily: MONO,
              fontWeight: 600,
              color: T.textPrimary,
              letterSpacing: "0.01em",
              minWidth: 170,
              textAlign: "center",
            }}
          >
            {weekLabel}
          </div>

          <button
            onClick={() => setWeekOffset((w) => Math.min(WEEK_LABELS.length - 1, w + 1))}
            disabled={weekOffset === WEEK_LABELS.length - 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: T.radiusMd,
              background: T.bgSubtle,
              border: `1px solid ${T.borderDefault}`,
              color:
                weekOffset === WEEK_LABELS.length - 1 ? T.textGhost : T.textSecondary,
              fontSize: 12,
              fontFamily: SANS,
              fontWeight: 500,
              cursor:
                weekOffset === WEEK_LABELS.length - 1 ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            Sem. siguiente
            <ChevronRightIcon size={14} />
          </button>
        </div>

        {/* Platform filter pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {PLATFORM_FILTERS.map((f) => {
            const active = platformFilter === f;
            return (
              <button
                key={f}
                onClick={() => setPlatformFilter(f)}
                style={{
                  padding: "5px 13px",
                  borderRadius: 20,
                  background: active ? T.orange : T.bgSubtle,
                  border: `1px solid ${active ? T.orange : T.borderDefault}`,
                  color: active ? "#fff" : T.textSecondary,
                  fontSize: 12,
                  fontFamily: SANS,
                  fontWeight: active ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
              >
                {f === "Instagram" && (
                  <span style={{ marginRight: 4, fontSize: 10 }}>●</span>
                )}
                {f === "Facebook" && (
                  <span style={{ marginRight: 4, fontSize: 10 }}>●</span>
                )}
                {f === "TikTok" && (
                  <span style={{ marginRight: 4, fontSize: 10 }}>●</span>
                )}
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Weekly calendar grid ── */}
      <div
        style={{
          borderRadius: T.radiusLg,
          border: `1px solid ${T.borderDefault}`,
          background: T.bgPanel,
          overflow: "hidden",
        }}
      >
        {/* Day header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: `1px solid ${T.borderDefault}`,
          }}
        >
          {DAY_NAMES.map((day, i) => {
            const isToday = isCurrentWeek && i === TODAY_WEEKDAY;
            return (
              <div
                key={day}
                style={{
                  padding: "10px 14px",
                  borderRight: i < 6 ? `1px solid ${T.borderDefault}` : "none",
                  background: isToday
                    ? "rgba(232,93,38,0.07)"
                    : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: MONO,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: isToday ? T.orange : T.textMuted,
                    textTransform: "uppercase",
                  }}
                >
                  {day}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontFamily: MONO,
                    fontWeight: 700,
                    color: isToday ? T.orange : T.textSecondary,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {isCurrentWeek ? DAY_DATES_MAY[i] : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Post cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            minHeight: 220,
          }}
        >
          {DAY_NAMES.map((day, i) => {
            const rawPosts = isCurrentWeek ? WEEK_POSTS[i] : [];
            const posts = filterPosts(rawPosts, platformFilter);
            const isToday = isCurrentWeek && i === TODAY_WEEKDAY;
            const isEmpty = posts.length === 0;

            return (
              <div
                key={day}
                style={{
                  padding: "12px 10px",
                  borderRight: i < 6 ? `1px solid ${T.borderDefault}` : "none",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  background: isToday
                    ? "rgba(232,93,38,0.04)"
                    : "transparent",
                  position: "relative",
                }}
              >
                {posts.map((post, pi) => (
                  <PostChip key={pi} post={post} />
                ))}

                {isEmpty && (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: SANS,
                        color: T.textGhost,
                      }}
                    >
                      {day === "Dom" ? "Descanso" : "Sin posts"}
                    </span>
                  </div>
                )}

                <AddButton />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Performance metrics bar ── */}
      <div
        style={{
          borderRadius: T.radiusLg,
          background: T.bgPanel,
          border: `1px solid ${T.borderDefault}`,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart2Icon size={15} color={T.purple} />
          <span
            style={{
              fontSize: 12,
              fontFamily: MONO,
              fontWeight: 700,
              color: T.textSecondary,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Performance semana actual
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <MetricCard
            label="Alcance total"
            value="47,320"
            icon={<TrendingUpIcon size={14} />}
            color={T.purple}
          />
          <MetricCard
            label="Impresiones"
            value="89,450"
            icon={<EyeIcon size={14} />}
            color={T.blue}
          />
          <MetricCard
            label="Engagement prom."
            value="8.7%"
            icon={<HeartIcon size={14} />}
            color={T.teal}
          />
          <MetricCard
            label="Publicados"
            value="3"
            icon={
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: T.teal,
                  display: "inline-block",
                }}
              />
            }
            color={T.teal}
          />
          <MetricCard
            label="Programados"
            value="4"
            icon={
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: T.blue,
                  display: "inline-block",
                }}
              />
            }
            color={T.blue}
          />
          <MetricCard
            label="Mejor post"
            value="1,243 likes"
            icon={<HeartIcon size={14} />}
            color={T.orange}
            sub='"Playa del Carmen a minutos de casa."'
          />
        </div>
      </div>

      {/* ── Phase notice ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          padding: "16px 20px",
          borderRadius: T.radiusLg,
          background: T.bgSubtle,
          border: `1px solid ${T.borderDefault}`,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: T.radiusMd,
            background: "rgba(232,93,38,0.12)",
            border: `1px solid rgba(232,93,38,0.2)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Share2Icon size={15} color={T.orange} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            style={{
              fontSize: 13,
              fontFamily: SANS,
              fontWeight: 700,
              color: T.textPrimary,
            }}
          >
            Publicación automática — Fase 4
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: SANS,
              color: T.textSecondary,
              lineHeight: 1.5,
            }}
          >
            Conecta Meta Business y TikTok Business API para programar y publicar
            directamente desde esta parrilla. Disponible en Fase 4 del roadmap.
          </span>
        </div>
        <a
          href="/areas/contenido"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 13px",
            borderRadius: T.radiusMd,
            background: T.bgOverlay,
            border: `1px solid ${T.borderEmphasis}`,
            color: T.textSecondary,
            fontSize: 12,
            fontFamily: SANS,
            fontWeight: 600,
            textDecoration: "none",
            flexShrink: 0,
            marginLeft: "auto",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = T.textPrimary;
            (e.currentTarget as HTMLAnchorElement).style.borderColor = T.borderEmphasis;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = T.textSecondary;
          }}
        >
          Nueva pieza
          <ArrowRightIcon size={12} />
        </a>
      </div>
    </div>
  );
}
