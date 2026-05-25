"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3Icon,
  FileTextIcon,
  Share2Icon,
  TargetIcon,
  PaletteIcon,
  TrendingUpIcon,
  SparklesIcon,
  BuildingIcon,
  SearchIcon,
  GalleryHorizontalEndIcon,
  MegaphoneIcon,
  MailIcon,
  MagnetIcon,
  LayersIcon,
} from "lucide-react";
import { DESARROLLOS, REGION_COLORS } from "@/lib/data/desarrollos";

const ICON_MAP: Record<string, React.ElementType> = {
  BarChart3: BarChart3Icon,
  FileText: FileTextIcon,
  Share2: Share2Icon,
  Target: TargetIcon,
  Palette: PaletteIcon,
  TrendingUp: TrendingUpIcon,
  Sparkles: SparklesIcon,
  Building: BuildingIcon,
  Carousel: GalleryHorizontalEndIcon,
  Megaphone: MegaphoneIcon,
  Mail: MailIcon,
  Magnet: MagnetIcon,
  Layers: LayersIcon,
};

const COMMANDS = [
  { id: "nav-dashboard", section: "Navegación", label: "Ir al dashboard", icon: "BarChart3", shortcut: ["G", "D"], kind: "nav", view: "inicio" },
  { id: "nav-desarrollos", section: "Navegación", label: "Desarrollos", icon: "Building", shortcut: ["G", "B"], kind: "nav", view: "desarrollos" },
  { id: "nav-contenido", section: "Navegación", label: "Contenido", icon: "FileText", shortcut: ["G", "C"], kind: "nav", view: "contenido" },
  { id: "nav-social", section: "Navegación", label: "Social Media", icon: "Share2", shortcut: ["G", "S"], kind: "nav", view: "social" },
  { id: "nav-paid", section: "Navegación", label: "Paid Media", icon: "Target", shortcut: ["G", "P"], kind: "nav", view: "paid" },
  { id: "nav-creativo", section: "Navegación", label: "Creativo", icon: "Palette", shortcut: ["G", "R"], kind: "nav", view: "creativo" },
  { id: "nav-conversion", section: "Navegación", label: "Conversión", icon: "TrendingUp", shortcut: ["G", "V"], kind: "nav", view: "conversion" },
  { id: "nav-atraccion", section: "Navegación", label: "Atracción", icon: "Magnet", shortcut: ["G", "A"], kind: "nav", view: "atraccion" },
  { id: "nav-diseno", section: "Navegación", label: "Diseño", icon: "Layers", shortcut: ["G", "E"], kind: "nav", view: "diseno" },
  { id: "act-generar", section: "Acciones", label: "Generar contenido nuevo…", icon: "Sparkles", shortcut: ["⌘", "N"], kind: "action", action: "generate" },
  ...DESARROLLOS.map((d) => ({
    id: `des-${d.slug}`,
    section: "Desarrollos",
    label: d.nombre,
    sub: `${d.region} · ${d.ciudad}`,
    icon: "Building",
    kind: "desarrollo",
    slug: d.slug,
    dot: REGION_COLORS[d.region],
  })),
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: 20,
        height: 20,
        padding: "0 5px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 4,
        color: "rgba(255,255,255,0.7)",
        fontSize: 10.5,
        fontFamily: "Geist Mono, ui-monospace, monospace",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string, slug?: string) => void;
  onGenerate: () => void;
}

export function CommandPalette({ open, onClose, onNavigate, onGenerate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return COMMANDS.slice(0, 14);
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        ("sub" in c && c.sub?.toLowerCase().includes(q)) ||
        c.section.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query]);

  useEffect(() => { setCursor(0); }, [query]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof COMMANDS>();
    filtered.forEach((c) => {
      if (!map.has(c.section)) map.set(c.section, []);
      map.get(c.section)!.push(c);
    });
    return [...map.entries()];
  }, [filtered]);

  const runCommand = (cmd: (typeof COMMANDS)[0]) => {
    onClose();
    if (cmd.kind === "nav" && "view" in cmd && cmd.view) onNavigate(cmd.view as string);
    else if (cmd.kind === "desarrollo" && "slug" in cmd) onNavigate("desarrollo", cmd.slug as string);
    else if (cmd.kind === "action" && "action" in cmd && cmd.action === "generate") onGenerate();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(filtered.length - 1, c + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[cursor]) runCommand(filtered[cursor]); }
    else if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        background: "rgba(15,15,15,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        animation: "fadeIn 160ms",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
        style={{
          width: 640,
          maxWidth: "92vw",
          background: "rgba(30,30,30,0.96)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(243,97,31,0.06)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "cmdkIn 200ms cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <SearchIcon size={16} style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar acciones, desarrollos, contenido…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: 15,
              fontFamily: "inherit",
            }}
          />
          <Kbd>esc</Kbd>
        </div>
        <div ref={listRef} style={{ maxHeight: "52vh", overflow: "auto", padding: "6px 0" }}>
          {groups.length === 0 && (
            <div style={{ padding: "36px 18px", color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          )}
          {groups.map(([section, items]) => (
            <div key={section}>
              <div
                style={{
                  padding: "10px 18px 4px",
                  fontSize: 10.5,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {section}
              </div>
              {items.map((cmd) => {
                flatIdx++;
                const isActive = flatIdx === cursor;
                const idx = flatIdx;
                const CmdIcon = ICON_MAP[cmd.icon] || FileTextIcon;
                return (
                  <button
                    key={cmd.id}
                    data-idx={idx}
                    onMouseEnter={() => setCursor(idx)}
                    onClick={() => runCommand(cmd)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 18px",
                      background: isActive ? "rgba(243,97,31,0.12)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      color: isActive ? "white" : "rgba(255,255,255,0.85)",
                      fontFamily: "inherit",
                      borderLeft: isActive ? "2px solid #F3611F" : "2px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: isActive ? "rgba(243,97,31,0.2)" : "rgba(255,255,255,0.04)",
                        color: isActive ? "#F3611F" : "rgba(255,255,255,0.7)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {"dot" in cmd && cmd.dot && (
                        <span
                          style={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: cmd.dot as string,
                            boxShadow: `0 0 6px ${cmd.dot}`,
                            border: "1.5px solid #1e1e1e",
                          }}
                        />
                      )}
                      <CmdIcon size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cmd.label}
                      </div>
                      {"sub" in cmd && cmd.sub && (
                        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {cmd.sub}
                        </div>
                      )}
                    </div>
                    {"shortcut" in cmd && cmd.shortcut && (
                      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                        {(cmd.shortcut as string[]).map((k, i) => (
                          <Kbd key={i}>{k}</Kbd>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "10px 18px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.18)",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Kbd>↵</Kbd> Abrir</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> Navegar</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Kbd>esc</Kbd> Cerrar</span>
          <div style={{ flex: 1 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "#F3611F", fontWeight: 600 }}>Nexus AI</span> powered
          </span>
        </div>
      </div>
    </div>
  );
}
