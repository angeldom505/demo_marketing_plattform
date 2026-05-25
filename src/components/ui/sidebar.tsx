"use client";

import React from "react";
import {
  HomeIcon,
  Building2Icon,
  BarChart3Icon,
  FileTextIcon,
  Share2Icon,
  TargetIcon,
  PaletteIcon,
  LayersIcon,
  TrendingUpIcon,
  MagnetIcon,
  GlobeIcon,
  FilmIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LogOutIcon,
} from "lucide-react";
import { DESARROLLOS, NAV_ITEMS, REGION_COLORS } from "@/lib/data/desarrollos";

const NAV_ICONS: Record<string, React.ElementType> = {
  Home: HomeIcon,
  Building2: Building2Icon,
  BarChart3: BarChart3Icon,
  FileText: FileTextIcon,
  Share2: Share2Icon,
  Target: TargetIcon,
  Palette: PaletteIcon,
  Layers: LayersIcon,
  TrendingUp: TrendingUpIcon,
  Magnet: MagnetIcon,
  Globe: GlobeIcon,
  Film: FilmIcon,
  Users: UsersIcon,
};

const PINNED = [
  { name: "Aukena", region: "Quintana Roo" },
  { name: "Central Park Bosque Real", region: "Estado de México" },
  { name: "Bonza", region: "Querétaro" },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeNav: string;
  onNavClick: (navId: string) => void;
  onNavigate: (view: string, slug?: string) => void;
  onLogout?: () => void;
  userEmail?: string;
}

export function Sidebar({
  collapsed,
  setCollapsed,
  activeNav,
  onNavClick,
  onNavigate,
  onLogout,
  userEmail,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 280,
        background: "#232323",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width 280ms cubic-bezier(.4,0,.2,1)",
        flexShrink: 0,
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => onNavigate("dashboard")}
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: "pointer",
          padding: collapsed ? "0" : "0 18px",
          overflow: "hidden",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #F3611F 0%, #7C3AED 100%)",
          display: "grid", placeItems: "center",
          boxShadow: "0 4px 16px rgba(243,97,31,0.35)",
        }}>
          <span style={{ color: "white", fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em" }}>N</span>
        </div>
        {!collapsed && (
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ color: "white", fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>Nexus</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Suite</div>
          </div>
        )}
      </div>

      {/* Workspace switcher */}
      {!collapsed && (
        <div style={{ padding: "14px 14px 6px" }}>
          <button
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 10px",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                background: "#3b3b3b",
                display: "grid",
                placeItems: "center",
                color: "#F3611F",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              MX
            </div>
            <span style={{ flex: 1, textAlign: "left" }}>Nexus Suite</span>
            <ChevronDownIcon size={14} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "12px 8px" : "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflow: "auto",
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: "12px 10px 6px",
              fontSize: 10.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.32)",
              fontWeight: 600,
            }}
          >
            Áreas
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const active = activeNav === item.id;
          const NavIcon = NAV_ICONS[item.icon];
          return (
            <div key={item.id} className="navItemWrap" style={{ position: "relative" }}>
              <button
                onClick={() => onNavClick(item.id)}
                className="navItem"
                style={{
                  width: "100%",
                  height: 40,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? "0" : "0 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "rgba(243,97,31,0.15)" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  color: active ? "white" : "rgba(255,255,255,0.62)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  transition: "background 150ms, color 150ms",
                  fontFamily: "inherit",
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: collapsed ? 6 : 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 2,
                      background: "#F3611F",
                      boxShadow: "0 0 10px rgba(243,97,31,0.7)",
                    }}
                  />
                )}
                <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
                  {NavIcon && <NavIcon size={18} />}
                </div>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              </button>
              {collapsed && (
                <div
                  className="navTip"
                  style={{
                    position: "absolute",
                    left: "calc(100% + 12px)",
                    top: "50%",
                    transform: "translateY(-50%) translateX(-4px)",
                    background: "rgba(20,20,20,0.96)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "6px 10px",
                    borderRadius: 6,
                    color: "white",
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    opacity: 0,
                    transition: "opacity 160ms, transform 160ms",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    zIndex: 50,
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}

        {!collapsed && (
          <>
            <div
              style={{
                padding: "20px 10px 6px",
                fontSize: 10.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.32)",
                fontWeight: 600,
              }}
            >
              Pinneados
            </div>
            {PINNED.map((p, i) => {
              const des = DESARROLLOS.find((d) => d.nombre === p.name);
              return (
                <button
                  key={i}
                  onClick={() => onNavigate("desarrollo", des?.slug)}
                  style={{
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontSize: 12.5,
                    textAlign: "left",
                  }}
                  className="navItem"
                >
                  {des?.logo ? (
                    <div style={{
                      width: 30, height: 30,
                      background: "linear-gradient(135deg, #F3611F22, #7C3AED22)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#F3611F" }}>{p.name.slice(0,2).toUpperCase()}</span>
                    </div>
                  ) : (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: REGION_COLORS[p.region], flexShrink: 0,
                      boxShadow: `0 0 8px ${REGION_COLORS[p.region]}80`,
                    }} />
                  )}
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* User block */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: collapsed ? 10 : 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6b4a3a, #3a2a22)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {userEmail ? userEmail.slice(0, 2).toUpperCase() : "RC"}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
              <div
                style={{
                  color: "white",
                  fontSize: 12.5,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userEmail ? userEmail.split("@")[0] : "Demo User"}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userEmail || "demo@nexus.ai"}
              </div>
            </div>
            <button
              title="Cerrar sesión"
              onClick={onLogout}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
              className="iconBtn"
            >
              <LogOutIcon size={15} />
            </button>
          </>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          right: -12,
          top: 56,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#2a2a2a",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.75)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRightIcon size={12} /> : <ChevronLeftIcon size={12} />}
      </button>
    </aside>
  );
}
