"use client";

import { motion, useSpring, useTransform } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { T } from "@/styles/tokens";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FunnelGradientStop {
  offset: string | number;
  color: string;
}

export interface FunnelStage {
  label: string;
  value: number;
  displayValue?: string;
  color?: string;
  gradient?: FunnelGradientStop[];
}

export interface FunnelChartProps {
  data: FunnelStage[];
  orientation?: "horizontal" | "vertical";
  color?: string;
  layers?: number;
  className?: string;
  style?: CSSProperties;
  showPercentage?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  formatPercentage?: (pct: number) => string;
  formatValue?: (value: number) => string;
  staggerDelay?: number;
  gap?: number;
  renderPattern?: (id: string, color: string) => ReactNode;
  edges?: "curved" | "straight";
  labelLayout?: "spread" | "grouped";
  labelOrientation?: "vertical" | "horizontal";
  labelAlign?: "center" | "start" | "end";
  maxValue?: number;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const fmtPct = (p: number) => `${Math.round(p)}%`;
const fmtVal = (v: number) => v.toLocaleString("es-MX");

const springConfig = { stiffness: 120, damping: 20, mass: 1 };
const hoverSpring  = { stiffness: 300, damping: 24 };

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

function hSegmentPath(
  normStart: number,
  normEnd: number,
  segW: number,
  H: number,
  layerScale: number,
  straight = false
) {
  const my = H / 2;
  const h0 = normStart * H * 0.44 * layerScale;
  const h1 = normEnd * H * 0.44 * layerScale;
  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`;
  }
  const cx  = segW * 0.55;
  const top = `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1}`;
  const bot = `L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0}`;
  return `${top} ${bot} Z`;
}

function vSegmentPath(
  normStart: number,
  normEnd: number,
  segH: number,
  W: number,
  layerScale: number,
  straight = false
) {
  const mx = W / 2;
  const w0 = normStart * W * 0.44 * layerScale;
  const w1 = normEnd * W * 0.44 * layerScale;
  if (straight) {
    return `M ${mx - w0} 0 L ${mx - w1} ${segH} L ${mx + w1} ${segH} L ${mx + w0} 0 Z`;
  }
  const cy   = segH * 0.55;
  const left = `M ${mx - w0} 0 C ${mx - w0} ${cy}, ${mx - w1} ${segH - cy}, ${mx - w1} ${segH}`;
  const right = `L ${mx + w1} ${segH} C ${mx + w1} ${segH - cy}, ${mx + w0} ${cy}, ${mx + w0} 0`;
  return `${left} ${right} Z`;
}

// ─── Animated Rings ───────────────────────────────────────────────────────────

function HRing({
  d, color, fill, opacity, hovered, ringIndex, totalRings,
}: {
  d: string; color: string; fill?: string; opacity: number;
  hovered: boolean; ringIndex: number; totalRings: number;
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const ringSpring = { stiffness: 300 - ringIndex * 60, damping: 24 - ringIndex * 3 };
  const scaleY = useSpring(1, ringSpring);
  useEffect(() => { scaleY.set(hovered ? extraScale : 1); }, [hovered, scaleY, extraScale]);
  return (
    <motion.path d={d} fill={fill ?? color} opacity={opacity}
      style={{ scaleY, transformOrigin: "center center" }} />
  );
}

function VRing({
  d, color, fill, opacity, hovered, ringIndex, totalRings,
}: {
  d: string; color: string; fill?: string; opacity: number;
  hovered: boolean; ringIndex: number; totalRings: number;
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const ringSpring = { stiffness: 300 - ringIndex * 60, damping: 24 - ringIndex * 3 };
  const scaleX = useSpring(1, ringSpring);
  useEffect(() => { scaleX.set(hovered ? extraScale : 1); }, [hovered, scaleX, extraScale]);
  return (
    <motion.path d={d} fill={fill ?? color} opacity={opacity}
      style={{ scaleX, transformOrigin: "center center" }} />
  );
}

// ─── Animated Segments ───────────────────────────────────────────────────────

function HSegment({
  index, normStart, normEnd, segW, fullH, color, layers, staggerDelay,
  hovered, dimmed, renderPattern, straight, gradientStops,
}: {
  index: number; normStart: number; normEnd: number; segW: number; fullH: number;
  color: string; layers: number; staggerDelay: number; hovered: boolean;
  dimmed: boolean; renderPattern?: (id: string, color: string) => ReactNode;
  straight: boolean; gradientStops?: FunnelGradientStop[];
}) {
  const patternId  = `funnel-h-pattern-${index}`;
  const gradientId = `funnel-h-grad-${index}`;
  const growProgress     = useSpring(0, springConfig);
  const entranceScaleX   = useTransform(growProgress, [0, 1], [0, 1]);
  const entranceScaleY   = useTransform(growProgress, [0, 1], [0, 1]);
  const dimOpacity       = useSpring(1, hoverSpring);

  useEffect(() => { dimOpacity.set(dimmed ? 0.4 : 1); }, [dimmed, dimOpacity]);
  useEffect(() => {
    const t = setTimeout(() => growProgress.set(1), index * staggerDelay * 1000);
    return () => clearTimeout(t);
  }, [growProgress, index, staggerDelay]);

  const rings = Array.from({ length: layers }, (_, l) => ({
    d: hSegmentPath(normStart, normEnd, segW, fullH, 1 - (l / layers) * 0.35, straight),
    opacity: 0.18 + (l / (layers - 1 || 1)) * 0.65,
  }));

  return (
    <motion.div className="pointer-events-none relative shrink-0 overflow-visible"
      style={{ width: segW, height: fullH, zIndex: hovered ? 10 : 1, opacity: dimOpacity }}>
      <motion.div className="absolute inset-0 overflow-visible"
        style={{ scaleX: entranceScaleX, scaleY: entranceScaleY, transformOrigin: "left center" }}>
        <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none" role="presentation" viewBox={`0 0 ${segW} ${fullH}`}>
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                {gradientStops.map(s => (
                  <stop key={`${s.offset}-${s.color}`}
                    offset={typeof s.offset === "number" ? `${s.offset * 100}%` : s.offset}
                    stopColor={s.color} />
                ))}
              </linearGradient>
            )}
            {renderPattern?.(patternId, color)}
          </defs>
          {rings.map((r, i) => {
            const isInner = i === rings.length - 1;
            const fill = isInner && renderPattern ? `url(#${patternId})`
              : isInner && gradientStops ? `url(#${gradientId})` : undefined;
            return (
              <HRing key={`h-${r.opacity.toFixed(2)}`} color={color} d={r.d}
                fill={fill} hovered={hovered} opacity={r.opacity} ringIndex={i} totalRings={layers} />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function VSegment({
  index, normStart, normEnd, segH, fullW, color, layers, staggerDelay,
  hovered, dimmed, renderPattern, straight, gradientStops,
}: {
  index: number; normStart: number; normEnd: number; segH: number; fullW: number;
  color: string; layers: number; staggerDelay: number; hovered: boolean;
  dimmed: boolean; renderPattern?: (id: string, color: string) => ReactNode;
  straight: boolean; gradientStops?: FunnelGradientStop[];
}) {
  const patternId  = `funnel-v-pattern-${index}`;
  const gradientId = `funnel-v-grad-${index}`;
  const growProgress   = useSpring(0, springConfig);
  const entranceScaleY = useTransform(growProgress, [0, 1], [0, 1]);
  const entranceScaleX = useTransform(growProgress, [0, 1], [0, 1]);
  const dimOpacity     = useSpring(1, hoverSpring);

  useEffect(() => { dimOpacity.set(dimmed ? 0.4 : 1); }, [dimmed, dimOpacity]);
  useEffect(() => {
    const t = setTimeout(() => growProgress.set(1), index * staggerDelay * 1000);
    return () => clearTimeout(t);
  }, [growProgress, index, staggerDelay]);

  const rings = Array.from({ length: layers }, (_, l) => ({
    d: vSegmentPath(normStart, normEnd, segH, fullW, 1 - (l / layers) * 0.35, straight),
    opacity: 0.18 + (l / (layers - 1 || 1)) * 0.65,
  }));

  return (
    <motion.div className="pointer-events-none relative shrink-0 overflow-visible"
      style={{ width: fullW, height: segH, zIndex: hovered ? 10 : 1, opacity: dimOpacity }}>
      <motion.div className="absolute inset-0 overflow-visible"
        style={{ scaleY: entranceScaleY, scaleX: entranceScaleX, transformOrigin: "center top" }}>
        <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none" role="presentation" viewBox={`0 0 ${fullW} ${segH}`}>
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                {gradientStops.map(s => (
                  <stop key={`${s.offset}-${s.color}`}
                    offset={typeof s.offset === "number" ? `${s.offset * 100}%` : s.offset}
                    stopColor={s.color} />
                ))}
              </linearGradient>
            )}
            {renderPattern?.(patternId, color)}
          </defs>
          {rings.map((r, i) => {
            const isInner = i === rings.length - 1;
            const fill = isInner && renderPattern ? `url(#${patternId})`
              : isInner && gradientStops ? `url(#${gradientId})` : undefined;
            return (
              <VRing key={`v-${r.opacity.toFixed(2)}`} color={color} d={r.d}
                fill={fill} hovered={hovered} opacity={r.opacity} ringIndex={i} totalRings={layers} />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Label Overlay ────────────────────────────────────────────────────────────

function SegmentLabel({
  stage, pct, isHorizontal, showValues, showPercentage, showLabels,
  formatPercentage, formatValue, index, staggerDelay, layout: _layout, orientation: _orientation, align: _align,
}: {
  stage: FunnelStage; pct: number; isHorizontal: boolean;
  showValues: boolean; showPercentage: boolean; showLabels: boolean;
  formatPercentage: (p: number) => string; formatValue: (v: number) => string;
  index: number; staggerDelay: number;
  layout?: string; orientation?: string; align?: string;
}) {
  const display = stage.displayValue ?? formatValue(stage.value);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * staggerDelay + 0.25, duration: 0.35, ease: "easeOut" }}
      className={cn("absolute inset-0 flex", isHorizontal ? "flex-col items-center" : "flex-row items-center")}
    >
      {isHorizontal ? (
        <>
          <div className="flex h-[16%] items-end justify-center pb-1">
            {showValues && (
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: '"IBM Plex Mono", monospace', whiteSpace: "nowrap" }}>
                {display}
              </span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center">
            {showPercentage && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: "rgba(255,255,255,0.12)", color: T.textPrimary,
                border: `0.5px solid rgba(255,255,255,0.18)`, whiteSpace: "nowrap",
                fontFamily: '"IBM Plex Mono", monospace',
              }}>
                {formatPercentage(pct)}
              </span>
            )}
          </div>
          <div className="flex h-[16%] items-start justify-center pt-1">
            {showLabels && (
              <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: "nowrap", fontFamily: '"DM Sans", sans-serif' }}>
                {stage.label}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex w-[16%] items-center justify-end pr-2">
            {showValues && (
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary, fontFamily: '"IBM Plex Mono", monospace', whiteSpace: "nowrap" }}>
                {display}
              </span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center">
            {showPercentage && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                background: "rgba(255,255,255,0.12)", color: T.textPrimary,
                border: `0.5px solid rgba(255,255,255,0.18)`, whiteSpace: "nowrap",
                fontFamily: '"IBM Plex Mono", monospace',
              }}>
                {formatPercentage(pct)}
              </span>
            )}
          </div>
          <div className="flex w-[16%] items-center justify-start pl-2">
            {showLabels && (
              <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: "nowrap", fontFamily: '"DM Sans", sans-serif' }}>
                {stage.label}
              </span>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── FunnelChart ─────────────────────────────────────────────────────────────

export function FunnelChart({
  data,
  orientation = "horizontal",
  color = T.purple,
  layers = 3,
  className,
  style,
  showPercentage = true,
  showValues = true,
  showLabels = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  formatPercentage = fmtPct,
  formatValue = fmtVal,
  staggerDelay = 0.12,
  gap = 4,
  renderPattern,
  edges = "curved",
  labelLayout = "spread",
  labelOrientation,
  labelAlign = "center",
  maxValue: propMaxValue,
}: FunnelChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null);

  const isControlled    = hoveredIndexProp !== undefined;
  const hoveredIndex    = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled) onHoverChange?.(index);
      else setInternalHoveredIndex(index);
    },
    [isControlled, onHoverChange]
  );

  const measure = useCallback(() => {
    if (!ref.current) return;
    const { width: w, height: h } = ref.current.getBoundingClientRect();
    if (w > 0 && h > 0) setSz({ w, h });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);

  if (!data.length) return null;

  const max     = propMaxValue ?? data[0]!.value;
  const n       = data.length;
  const norms   = data.map(d => d.value / max);
  const horiz   = orientation === "horizontal";
  const { w: W, h: H } = sz;
  const totalGap = gap * (n - 1);
  const segW = (W - (horiz ? totalGap : 0)) / n;
  const segH = (H - (horiz ? 0 : totalGap)) / n;

  return (
    <div ref={ref}
      className={cn("relative w-full select-none overflow-visible", className)}
      style={{ aspectRatio: horiz ? "2.2 / 1" : "1 / 1.8", ...style }}>
      {W > 0 && H > 0 && (
        <>
          {/* Segments */}
          <div className={cn("absolute inset-0 flex overflow-visible", horiz ? "flex-row" : "flex-col")}
            style={{ gap }}>
            {data.map((stage, i) => {
              const normStart = norms[i] ?? 0;
              const normEnd   = norms[Math.min(i + 1, n - 1)] ?? 0;
              const segColor  = stage.gradient?.[0]?.color ?? (stage.color ?? color);
              return horiz ? (
                <HSegment key={stage.label} index={i}
                  color={segColor} dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  fullH={H} gradientStops={stage.gradient} hovered={hoveredIndex === i}
                  layers={layers} normEnd={normEnd} normStart={normStart}
                  renderPattern={renderPattern} segW={segW} staggerDelay={staggerDelay}
                  straight={edges === "straight"} />
              ) : (
                <VSegment key={stage.label} index={i}
                  color={segColor} dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  fullW={W} gradientStops={stage.gradient} hovered={hoveredIndex === i}
                  layers={layers} normEnd={normEnd} normStart={normStart}
                  renderPattern={renderPattern} segH={segH} staggerDelay={staggerDelay}
                  straight={edges === "straight"} />
              );
            })}
          </div>

          {/* Label overlays */}
          {data.map((stage, i) => {
            const pct      = (stage.value / max) * 100;
            const posStyle: CSSProperties = horiz
              ? { left: (segW + gap) * i, width: segW, top: 0, height: H }
              : { top: (segH + gap) * i, height: segH, left: 0, width: W };
            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
            return (
              <motion.div key={`lbl-${stage.label}`}
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                className="absolute cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ ...posStyle, zIndex: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                <SegmentLabel
                  formatPercentage={formatPercentage} formatValue={formatValue}
                  index={i} isHorizontal={horiz} layout={labelLayout}
                  orientation={labelOrientation} pct={pct}
                  showLabels={showLabels} showPercentage={showPercentage}
                  showValues={showValues} stage={stage} staggerDelay={staggerDelay}
                  align={labelAlign} />
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}

FunnelChart.displayName = "FunnelChart";
export default FunnelChart;
