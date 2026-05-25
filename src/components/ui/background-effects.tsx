"use client";

import React, { useEffect, useState } from "react";

interface Particle {
  x: string;
  y: string;
  d: string;
  delay: string;
  s: string;
}

export function BackgroundEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const pts: Particle[] = Array.from({ length: 14 }, (_, i) => ({
      x: `${(i * 73) % 100}%`,
      y: `${(i * 41) % 100}%`,
      d: `${18 + (i % 7) * 4}s`,
      delay: `${i * 1.3}s`,
      s: `${1 + (i % 4) * 0.5}px`,
    }));
    setParticles(pts);
  }, []);

  return (
    <>
      <div className="bgGrid" />
      <div className="bgGlow1" />
      <div className="bgGlow2" />
      <div className="bgNoise" />
      <div className="bgParticles">
        {particles.map((p, i) => (
          <span
            key={i}
            style={
              {
                "--x": p.x,
                "--y": p.y,
                "--d": p.d,
                "--delay": p.delay,
                "--s": p.s,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}

export function CountUp({
  end,
  duration = 1100,
}: {
  end: number;
  duration?: number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <span>{Math.round(val).toLocaleString("es-MX")}</span>;
}

export function MiniSpark({
  points,
  color = "#F3611F",
  w = 64,
  h = 18,
}: {
  points: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const dx = w / (points.length - 1);
  const xy = points.map((p, i) => [
    i * dx,
    h - ((p - min) / range) * (h - 2) - 1,
  ]);
  const line = xy
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg
      width={w}
      height={h}
      style={{ overflow: "visible", display: "block" }}
    >
      <path d={area} fill={color} opacity="0.18" />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {xy.length > 0 && (
        <circle
          cx={xy[xy.length - 1][0]}
          cy={xy[xy.length - 1][1]}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}
