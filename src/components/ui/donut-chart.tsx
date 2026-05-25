"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { T } from "@/styles/tokens";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
  [key: string]: unknown;
}

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutSegment[];
  totalValue?: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  animationDelayPerSegment?: number;
  highlightOnHover?: boolean;
  centerContent?: React.ReactNode;
  onSegmentHover?: (segment: DonutSegment | null) => void;
}

export const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      totalValue: propTotalValue,
      size = 200,
      strokeWidth = 20,
      animationDuration = 0.9,
      animationDelayPerSegment = 0.05,
      highlightOnHover = true,
      centerContent,
      onSegmentHover,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [hovered, setHovered] = React.useState<DonutSegment | null>(null);

    const total = React.useMemo(
      () => propTotalValue ?? data.reduce((s, d) => s + d.value, 0),
      [data, propTotalValue]
    );

    React.useEffect(() => {
      onSegmentHover?.(hovered);
    }, [hovered, onSegmentHover]);

    const radius        = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    let cumPct = 0;

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size, ...style }}
        onMouseLeave={() => setHovered(null)}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible", transform: "rotate(-90deg)" }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={T.borderFaint}
            strokeWidth={strokeWidth}
          />

          <AnimatePresence>
            {data.map((seg, i) => {
              if (seg.value === 0) return null;
              const pct     = total === 0 ? 0 : (seg.value / total) * 100;
              const dashArr = `${(pct / 100) * circumference} ${circumference}`;
              const dashOff = -(cumPct / 100) * circumference;
              const isActive = hovered?.label === seg.label;
              cumPct += pct;

              return (
                <motion.circle
                  key={seg.label ?? i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isActive ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={dashArr}
                  strokeDashoffset={dashOff}
                  strokeLinecap="round"
                  initial={{ opacity: 0, strokeDashoffset: circumference }}
                  animate={{ opacity: 1, strokeDashoffset: dashOff }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: {
                      duration: 0.3,
                      delay: i * animationDelayPerSegment,
                    },
                    strokeDashoffset: {
                      duration: animationDuration,
                      delay: i * animationDelayPerSegment,
                      ease: "easeOut",
                    },
                    strokeWidth: { duration: 0.15 },
                  }}
                  style={{
                    cursor: highlightOnHover ? "pointer" : "default",
                    filter: isActive
                      ? `drop-shadow(0 0 6px ${seg.color})`
                      : "none",
                    transition: "filter 0.2s, stroke-width 0.15s",
                  }}
                  onMouseEnter={() => setHovered(seg)}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {centerContent && (
          <div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              width: size - strokeWidth * 2.5,
              height: size - strokeWidth * 2.5,
            }}
          >
            {centerContent}
          </div>
        )}
      </div>
    );
  }
);

DonutChart.displayName = "DonutChart";

// ─── DonutLegend ──────────────────────────────────────────────────────────────

export function DonutLegend({
  data,
  total,
  hoveredLabel,
  onHover,
}: {
  data: DonutSegment[];
  total: number;
  hoveredLabel?: string | null;
  onHover?: (label: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((d) => {
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
        const isH = hoveredLabel === d.label;
        return (
          <div
            key={d.label}
            onMouseEnter={() => onHover?.(d.label)}
            onMouseLeave={() => onHover?.(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "5px 8px",
              borderRadius: 6,
              background: isH ? T.bgSubtle : "transparent",
              cursor: "default",
              transition: "background 120ms",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: d.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: isH ? T.textPrimary : T.textSecondary,
                  fontFamily: SANS,
                  transition: "color 120ms",
                }}
              >
                {d.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: MONO,
                  color: T.textSecondary,
                }}
              >
                {d.value.toLocaleString("es-MX")}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: MONO,
                  color: T.textMuted,
                  width: 40,
                  textAlign: "right",
                }}
              >
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
