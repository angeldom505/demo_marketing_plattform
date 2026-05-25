"use client";

import React from "react";
import { REGION_COLORS, type Desarrollo } from "@/lib/data/desarrollos";

function InstagramPreview({ d }: { d: Desarrollo }) {
  const color = REGION_COLORS[d.region];
  return (
    <div
      style={{
        width: 280,
        background: "#0a0a0a",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F3611F, #E05A1A)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            boxShadow: "0 0 0 2px #0a0a0a, 0 0 0 3px #F3611F",
          }}
        >
          HU
        </div>
        <div style={{ flex: 1, fontSize: 11.5, color: "white", fontWeight: 600 }}>
          hogaresunion_mx
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
            {d.ciudad}, {d.region}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "white" }} />
          ))}
        </div>
      </div>
      <div
        style={{
          aspectRatio: "1",
          position: "relative",
          background: `radial-gradient(circle at 30% 70%, ${color}55, transparent 55%), repeating-linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.01) 6px, rgba(255,255,255,0.01) 12px), #1a1a1a`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {d.nombre}
          </div>
          <div
            style={{
              fontSize: 10,
              marginTop: 4,
              fontFamily: "Geist Mono, ui-monospace, monospace",
              letterSpacing: "0.1em",
            }}
          >
            FASE 2 · 84 UND.
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 10px 6px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 18, color: "white" }}>♡</span>
        <span style={{ fontSize: 16, color: "white" }}>💬</span>
        <span style={{ fontSize: 16, color: "white" }}>➤</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 16, color: "white" }}>⌘</span>
      </div>
      <div style={{ padding: "0 10px 10px", color: "white", fontSize: 10.5, lineHeight: 1.4 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>2,341 me gusta</div>
        <div>
          <strong>hogaresunion_mx</strong> 🌅 La playa que aún no descubren los inversionistas. A 12 minutos del aeropuerto y a 5 del mar…{" "}
          <span style={{ color: "rgba(255,255,255,0.5)" }}>ver más</span>
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 9.5,
            marginTop: 4,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          hace 2 horas
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ d }: { d: Desarrollo }) {
  return (
    <div
      style={{
        width: 360,
        background: "white",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#1a1a1a",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          background: "#f4f4f4",
          borderBottom: "1px solid #e5e5e5",
          fontFamily: "-apple-system, sans-serif",
          fontSize: 11,
        }}
      >
        <div style={{ color: "#666", marginBottom: 2 }}>
          <strong>De:</strong> Equipo Aukena &lt;hola@hogaresunion.mx&gt;
        </div>
        <div style={{ color: "#666" }}>
          <strong>Para:</strong> renata@familia.mx
        </div>
      </div>
      <div style={{ padding: "14px 18px 4px", fontFamily: "-apple-system, sans-serif" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.01em" }}>
          Renata, recordamos cuándo te interesó {d.nombre} 🌊
        </div>
        <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
          Reactivamos tu cotización con un beneficio exclusivo
        </div>
      </div>
      <div
        style={{
          margin: "12px 0",
          padding: "24px 18px",
          textAlign: "center",
          background: "linear-gradient(135deg, #F3611F, #E05A1A)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "-apple-system, sans-serif" }}>
          Fase 2 abre hoy
        </div>
        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4, fontFamily: "-apple-system, sans-serif" }}>
          84 unidades · enganche 8% · 12% bajo precio público
        </div>
      </div>
      <div style={{ padding: "0 18px 16px", fontSize: 13, lineHeight: 1.55, color: "#2a2a2a" }}>
        <p style={{ margin: "0 0 10px" }}>Hola Renata,</p>
        <p style={{ margin: "0 0 10px" }}>
          Hace 3 meses nos contactaste para conocer {d.nombre}. Sabemos que la decisión de comprar segunda casa no se toma en una llamada…
        </p>
        <div
          style={{
            margin: "14px 0",
            padding: "11px 14px",
            background: "#F3611F",
            color: "white",
            borderRadius: 6,
            textAlign: "center",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "-apple-system, sans-serif",
          }}
        >
          Agendar 15 minutos →
        </div>
        <p style={{ margin: "12px 0 0", color: "#888", fontSize: 11, fontFamily: "-apple-system, sans-serif" }}>
          — Equipo {d.nombre} · Hogares Unión
        </p>
      </div>
    </div>
  );
}

function AdPreview({ d }: { d: Desarrollo }) {
  const color = REGION_COLORS[d.region];
  return (
    <div
      style={{
        width: 320,
        background: "#0a0a0a",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F3611F, #E05A1A)",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          HU
        </div>
        <div style={{ flex: 1, fontSize: 12, color: "white", fontWeight: 600 }}>
          Hogares Unión
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 400, display: "flex", alignItems: "center", gap: 4 }}>
            Anunciado · <span>🌐</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 12px 8px", color: "white", fontSize: 12, lineHeight: 1.45 }}>
        Vive a 12 min del aeropuerto y a 5 del mar. {d.nombre} abre Fase 2 con enganche desde 8%.
      </div>
      <div
        style={{
          aspectRatio: "1.91 / 1",
          background: `linear-gradient(135deg, #1a1a1a 0%, ${color}33 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 12px)`,
          display: "grid",
          placeItems: "center",
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {d.nombre}
          </div>
          <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>
            FASE 2 · {d.region.toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{ padding: "10px 12px", background: "#1a1a1a", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>hogaresunion.mx</div>
          <div
            style={{
              fontSize: 12.5,
              color: "white",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Tu segunda casa empieza con 8% de enganche
          </div>
        </div>
        <button
          style={{
            padding: "7px 12px",
            background: "#F3611F",
            color: "white",
            border: "none",
            borderRadius: 5,
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Más info
        </button>
      </div>
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(255,255,255,0.55)",
          fontSize: 11,
        }}
      >
        <span>♡ 1.2K</span>
        <span>💬 84</span>
        <span>➤ 31</span>
      </div>
    </div>
  );
}

function BlogPreview({ d }: { d: Desarrollo }) {
  const color = REGION_COLORS[d.region];
  return (
    <div
      style={{
        width: 360,
        background: "#f7f6f4",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{
          aspectRatio: "2/1",
          background: `linear-gradient(135deg, #1a1a1a, ${color}aa)`,
          position: "relative",
          padding: 14,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div style={{ color: "white", fontFamily: "Georgia, serif" }}>
          <div
            style={{
              fontSize: 10,
              opacity: 0.8,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
              fontFamily: "-apple-system, sans-serif",
            }}
          >
            Insights · Inversión
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Por qué {d.ciudad} dejó de ser un destino y se convirtió en una clase de activo
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 18px", fontFamily: "Georgia, serif" }}>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#3a3a3a" }}>
          Si en 2019 alguien te decía que {d.ciudad} iba a competir con Miami por dólares de inversión inmobiliaria, lo mandabas a dormir. Hoy, los números cuentan otra historia…
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 10,
            fontFamily: "-apple-system, sans-serif",
            fontSize: 10.5,
            color: "#888",
          }}
        >
          <span>HU Insights</span>
          <span>·</span>
          <span>6 min de lectura</span>
          <span>·</span>
          <span>1.4K vistas</span>
        </div>
      </div>
    </div>
  );
}

const PREVIEWS: Record<string, React.ComponentType<{ d: Desarrollo }>> = {
  Instagram: InstagramPreview,
  Email: EmailPreview,
  Megaphone: AdPreview,
  BookOpen: BlogPreview,
  Mail: EmailPreview,
  Carousel: InstagramPreview,
  Film: InstagramPreview,
};

const PREVIEW_LABELS: Record<string, string> = {
  Instagram: "Instagram",
  Email: "Email",
  Megaphone: "Anuncio Meta",
  BookOpen: "Blog post",
  Mail: "Email",
  Carousel: "Carrusel Instagram",
  Film: "Reel",
};

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  type: string | null;
  d: Desarrollo | null;
}

export function PreviewModal({ open, onClose, type, d }: PreviewModalProps) {
  if (!open || !type || !d) return null;
  const Preview = PREVIEWS[type] || InstagramPreview;
  const label = PREVIEW_LABELS[type] || type;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 700,
        background: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
        animation: "fadeIn 200ms",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          animation: "modalIn 280ms cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 16px",
            background: "rgba(28,28,28,0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 100,
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Preview en formato real
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{label}</span>
        </div>
        <Preview d={d} />
        <button
          onClick={onClose}
          style={{
            padding: "6px 14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            borderRadius: 16,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          className="iconBtn"
        >
          Cerrar (esc)
        </button>
      </div>
    </div>
  );
}
