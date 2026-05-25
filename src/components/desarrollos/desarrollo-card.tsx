"use client";

import React from "react";
import Image from "next/image";
import { MapPinIcon, SparklesIcon } from "lucide-react";
import { DESARROLLOS, REGION_COLORS, type Desarrollo } from "@/lib/data/desarrollos";

function MateriaPrima({ d }: { d: Desarrollo }) {
  const items = [
    { key: "ficha", label: "Ficha", done: d.ficha },
    { key: "storytelling", label: "Story", done: d.storytelling },
    { key: "competencia", label: "Comp", done: d.competencia },
    { key: "audiencias", label: "Audien", done: d.audiencias },
  ];
  const done = items.filter((i) => i.done).length;
  const pct = (done / items.length) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          Documentación
        </span>
        <span style={{ fontSize: 11, color: pct === 100 ? "#1D9E75" : "rgba(255,255,255,0.45)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {done}/4
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct === 100 ? "#1D9E75" : "#E85D26",
            transition: "width 400ms",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              flex: 1,
              padding: "3px 6px",
              borderRadius: 3,
              fontSize: 9.5,
              letterSpacing: "0.04em",
              textAlign: "center",
              background: item.done ? "rgba(232,93,38,0.10)" : "rgba(255,255,255,0.03)",
              color: item.done ? "#E85D26" : "rgba(255,255,255,0.28)",
              fontWeight: 500,
              border: item.done ? "0.5px solid rgba(232,93,38,0.22)" : "0.5px solid rgba(255,255,255,0.05)",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DesarrolloCardProps {
  d: Desarrollo;
  onClick: () => void;
  onGenerate: (d: Desarrollo) => void;
}

export function DesarrolloCard({ d, onClick, onGenerate }: DesarrolloCardProps) {
  const regionColor = REGION_COLORS[d.region];
  const index = DESARROLLOS.indexOf(d);

  return (
    <div
      onClick={onClick}
      className="desCard"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: "pointer",
        transition: "transform 220ms cubic-bezier(.34,1.56,.64,1), box-shadow 220ms, border-color 220ms, background 220ms",
        position: "relative",
        overflow: "hidden",
        minHeight: 220,
      }}
    >
      {/* Region accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${regionColor}, transparent)`,
          opacity: 0.6,
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 9px",
            borderRadius: 12,
            background: `${regionColor}12`,
            border: `0.5px solid ${regionColor}35`,
            color: regionColor,
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: regionColor, opacity: 0.85 }} />
          {d.region}
        </div>
        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.32)", fontFamily: "Geist Mono, ui-monospace, monospace", fontWeight: 500 }}>
          HU-{String(index + 1).padStart(3, "0")}
        </span>
      </div>

      {/* Logo o nombre */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {d.logo ? (
          <div style={{
            height: 88,
            background: "rgba(255,255,255,0.97)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 12px",
            overflow: "hidden",
          }}>
            <Image
              src={d.logo}
              alt={d.nombre}
              width={240}
              height={68}
              style={{ objectFit: "contain", maxHeight: 68, width: "auto", maxWidth: "100%" }}
            />
          </div>
        ) : (
          <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {d.nombre}
          </h3>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
          <MapPinIcon size={11} />
          {d.ciudad} · {d.unidades} unidades
        </div>
      </div>

      <MateriaPrima d={d} />

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ flex: 1, fontSize: 11.5, color: "rgba(255,255,255,0.45)" }}>
          {d.tipologia}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onGenerate(d); }}
          className="genBtn"
          style={{
            height: 28,
            padding: "0 10px",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(243,97,31,0.12)",
            border: "1px solid rgba(243,97,31,0.32)",
            color: "#F3611F",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 11.5,
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          <SparklesIcon size={11} />
          Generar
        </button>
      </div>

      {/* Hover glow */}
      <div
        className="cardGlow"
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: 13,
          pointerEvents: "none",
          opacity: 0,
          boxShadow: "0 0 0 1px rgba(232,93,38,0.22), 0 16px 48px -16px rgba(232,93,38,0.2)",
          transition: "opacity 240ms",
        }}
      />
    </div>
  );
}
