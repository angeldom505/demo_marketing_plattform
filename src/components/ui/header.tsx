"use client";

import React from "react";
import { SearchIcon, BellIcon, SparklesIcon, LinkIcon } from "lucide-react";
import { DESARROLLOS } from "@/lib/data/desarrollos";

interface HeaderProps {
  view: string;
  slug: string | null;
  onNavigate: (view: string, slug?: string) => void;
  onOpenCmdK: () => void;
  onGenerate: () => void;
}

export function Header({ view, slug, onNavigate, onOpenCmdK, onGenerate }: HeaderProps) {
  const desarrollo = slug ? DESARROLLOS.find((d) => d.slug === slug) : null;

  const crumbs: { label: string; onClick?: () => void }[] = [
    { label: "HU Marketing Suite", onClick: () => onNavigate("dashboard") },
  ];
  if (slug && desarrollo) {
    crumbs.push({ label: "Desarrollos", onClick: () => onNavigate("desarrollos") });
    crumbs.push({ label: desarrollo.nombre });
  } else if (view === "desarrollos") {
    crumbs.push({ label: "Desarrollos" });
  } else {
    crumbs.push({ label: "Dashboard" });
  }

  return (
    <header
      style={{
        height: 64,
        flexShrink: 0,
        background: "rgba(35,35,35,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 14,
        position: "sticky",
        top: 0,
        zIndex: 4,
      }}
    >
      {/* Isotipo — lente circular + lente cuadrada */}
      <svg
        width="22" height="12" viewBox="0 0 22 12"
        fill="none" aria-hidden="true"
        style={{ flexShrink: 0, opacity: 0.72 }}
      >
        <defs>
          <radialGradient id="iso-o" cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="rgba(232,93,38,0.22)" />
            <stop offset="100%" stopColor="rgba(232,93,38,0)" />
          </radialGradient>
          <radialGradient id="iso-w" cx="35%" cy="28%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* Lente izquierda — circular */}
        <circle cx="5" cy="6" r="4" fill="url(#iso-o)" stroke="rgba(232,93,38,0.52)" strokeWidth="0.9" />
        {/* Puente */}
        <line x1="9" y1="6" x2="13" y2="6" stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" strokeLinecap="round" />
        {/* Lente derecha — cuadrada */}
        <rect x="13" y="2" width="8" height="8" rx="1.5" fill="url(#iso-w)" stroke="rgba(255,255,255,0.28)" strokeWidth="0.9" />
      </svg>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>}
            {c.onClick ? (
              <button
                onClick={c.onClick}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.55)",
                  padding: "4px 6px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "inherit",
                }}
                className="iconBtn"
              >
                {c.label}
              </button>
            ) : (
              <span style={{ color: "white", fontWeight: 600 }}>{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Search trigger */}
      <button
        onClick={onOpenCmdK}
        className="iconBtn"
        style={{
          marginLeft: 16,
          flex: 1,
          maxWidth: 380,
          height: 36,
          borderRadius: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          cursor: "pointer",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "inherit",
          fontSize: 13,
          textAlign: "left",
        }}
      >
        <SearchIcon size={15} />
        <span style={{ flex: 1 }}>Buscar desarrollos, posts, campañas…</span>
        <span
          style={{
            fontSize: 10.5,
            padding: "2px 6px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            fontFamily: "Geist Mono, ui-monospace, monospace",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          ⌘K
        </span>
      </button>

      <div style={{ flex: 1 }} />

      {/* Integrations status — pending connection */}
      <div
        style={{
          height: 32,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(234,179,8,0.06)",
          border: "1px solid rgba(234,179,8,0.2)",
          borderRadius: 16,
          fontSize: 11.5,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 500,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EAB308", boxShadow: "0 0 8px #EAB308", flexShrink: 0 }} />
        <LinkIcon size={11} />
        <span>Integraciones pendientes</span>
      </div>

      {/* Notifications — empty state */}
      <button
        className="iconBtn"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.55)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        title="Sin notificaciones"
      >
        <BellIcon size={16} />
      </button>

      {/* CTA */}
      <button
        onClick={() => onGenerate()}
        className="primaryBtn rippleBtn"
        style={{
          height: 38,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "linear-gradient(135deg, #F3611F, #E05A1A)",
          border: "none",
          borderRadius: 8,
          color: "white",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(243,97,31,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
          fontFamily: "inherit",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SparklesIcon size={15} />
        Generar contenido
      </button>
    </header>
  );
}
