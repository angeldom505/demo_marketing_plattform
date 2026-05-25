import React from "react";
import { T } from "@/styles/tokens";

interface Props {
  value: number;
  suffix?: string;
}

export function DeltaBadge({ value, suffix = "%" }: Props) {
  const pos = value > 0;
  const zero = value === 0;
  const color  = zero ? T.textGhost  : pos ? T.teal  : T.red;
  const bg     = zero ? "transparent" : pos ? T.tealBg : T.redBg;
  const arrow  = zero ? "→" : pos ? "↑" : "↓";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: bg, color, fontSize: 11, fontWeight: 500,
      padding: "2px 7px", borderRadius: 4, letterSpacing: "0.01em",
    }}>
      {arrow} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}
