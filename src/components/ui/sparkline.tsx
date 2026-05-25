"use client";
import React, { useMemo } from "react";

interface Props {
  data: number[];
  color: string;
  height?: number;
  showDot?: boolean;
}

export function Sparkline({ data, color, height = 40, showDot = true }: Props) {
  const w = 80;
  const h = height;
  const pad = 2;

  const points = useMemo(() => {
    if (!data.length) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = (w - pad * 2) / Math.max(data.length - 1, 1);
    return data
      .map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, w, h, pad]);

  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(data.length - 1, 1);
  const lastX = pad + (data.length - 1) * step;
  const lastY = h - pad - ((data[data.length - 1] - min) / range) * (h - pad * 2);

  const areaPoints = `${pad},${h} ${points} ${lastX},${h}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1} strokeLinejoin="round" strokeLinecap="round" />
      {showDot && (
        <circle cx={lastX} cy={lastY} r={2} fill={color} />
      )}
    </svg>
  );
}
