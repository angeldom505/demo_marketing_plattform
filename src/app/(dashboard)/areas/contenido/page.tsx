"use client";

import React, { useState, useEffect } from "react";
import {
  CameraIcon,
  GalleryHorizontalEndIcon,
  BookOpenIcon,
  MailIcon,
  MegaphoneIcon,
  FilmIcon,
  SparklesIcon,
  ClockIcon,
  FileTextIcon,
} from "lucide-react";
import { GenerateModal } from "@/components/ui/generate-modal";
import { useToast } from "@/components/ui/toasts";
import { DESARROLLOS, CONTENT_TYPES, getHistorial, type HistorialItem } from "@/lib/data/desarrollos";

const CONTENT_ICONS: Record<string, React.ElementType> = {
  Instagram: CameraIcon,
  Carousel: GalleryHorizontalEndIcon,
  BookOpen: BookOpenIcon,
  Mail: MailIcon,
  Megaphone: MegaphoneIcon,
  Film: FilmIcon,
};

export default function ContenidoPage() {
  const [genModal, setGenModal] = useState({ open: false, des: null as string | null, type: "post" });
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const toast = useToast();

  useEffect(() => {
    setHistorial(getHistorial());
  }, [genModal.open]);

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, color: "white", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Contenido
          </h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Genera copy diferenciado por desarrollo con IA · {historial.length} piezas guardadas
          </p>
        </div>
        <button
          onClick={() => setGenModal({ open: true, des: null, type: "post" })}
          className="primaryBtn"
          style={{
            height: 42,
            padding: "0 20px",
            background: "linear-gradient(135deg, #F3611F, #E05A1A)",
            border: "none",
            borderRadius: 9,
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 22px rgba(243,97,31,0.35)",
          }}
        >
          <SparklesIcon size={15} />
          Nueva pieza
        </button>
      </div>

      {/* Content type shortcuts */}
      <section>
        <h2 style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Generar por tipo
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
          {CONTENT_TYPES.map((ct) => {
            const Icon = CONTENT_ICONS[ct.icon] || SparklesIcon;
            return (
              <button
                key={ct.id}
                onClick={() => setGenModal({ open: true, des: DESARROLLOS[0]?.nombre || null, type: ct.id })}
                style={{
                  padding: "16px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(243,97,31,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(243,97,31,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(243,97,31,0.1)", color: "#F3611F", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ color: "white", fontSize: 12.5, fontWeight: 600 }}>{ct.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Generar →</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Historial */}
      <section>
        <h2 style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Historial reciente
        </h2>

        {historial.length === 0 ? (
          <div style={{ padding: "48px 24px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(243,97,31,0.08)", color: "#F3611F", display: "grid", placeItems: "center" }}>
              <SparklesIcon size={20} />
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>Sin piezas generadas aún</div>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                Genera tu primer contenido y guárdalo — aparecerá aquí.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
            {historial.map((item, i) => {
              const Icon = CONTENT_ICONS[item.channel] || FileTextIcon;
              const date = new Date(item.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
              const snippet = item.output.slice(0, 100).replace(/\n/g, " ");
              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto auto",
                    gap: 14,
                    alignItems: "center",
                    padding: "14px 20px",
                    borderBottom: i < historial.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                  className="histRow"
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(243,97,31,0.1)", color: "#F3611F", display: "grid", placeItems: "center" }}>
                    <Icon size={15} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: 13, fontWeight: 500 }}>{item.tipoLabel} · {item.desarrollo}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {snippet}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 11.5, flexShrink: 0 }}>
                    <ClockIcon size={11} />
                    {date}
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                    Borrador
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <GenerateModal
        open={genModal.open}
        onClose={() => setGenModal({ open: false, des: null, type: "post" })}
        defaultDesarrollo={genModal.des}
        defaultType={genModal.type}
        toast={toast}
      />
    </div>
  );
}
