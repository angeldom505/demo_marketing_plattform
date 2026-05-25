"use client";

import React, { useState } from "react";
import { DESARROLLOS, REGION_COLORS } from "@/lib/data/desarrollos";
import { DesarrolloCard } from "@/components/desarrollos/desarrollo-card";
import { GenerateModal } from "@/components/ui/generate-modal";
import { ToastProvider, useToast } from "@/components/ui/toasts";
import { useRouter } from "next/navigation";
import type { Desarrollo } from "@/lib/data/desarrollos";

function DesarrollosInner() {
  const [filter, setFilter] = useState("all");
  const [genModal, setGenModal] = useState<{ open: boolean; des: string | null; type: string }>({
    open: false, des: null, type: "post",
  });
  const toast = useToast();
  const router = useRouter();

  const regions = [...new Set(DESARROLLOS.map((d) => d.region))];
  const visible = filter === "all" ? DESARROLLOS : DESARROLLOS.filter((d) => d.region === filter);

  return (
    <>
      <div style={{ padding: "32px 40px 60px", maxWidth: 1500, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, color: "white", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Desarrollos
            </h1>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              {DESARROLLOS.length} desarrollos activos en {regions.length} regiones
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              height: 30, padding: "0 14px",
              background: filter === "all" ? "rgba(232,93,38,0.12)" : "rgba(255,255,255,0.03)",
              border: filter === "all" ? "0.5px solid rgba(232,93,38,0.35)" : "0.5px solid rgba(255,255,255,0.08)",
              color: filter === "all" ? "#E85D26" : "rgba(255,255,255,0.55)",
              borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
            }}
          >
            Todos ({DESARROLLOS.length})
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              style={{
                height: 30, padding: "0 12px",
                display: "inline-flex", alignItems: "center", gap: 6,
                background: filter === r ? "rgba(232,93,38,0.10)" : "rgba(255,255,255,0.03)",
                border: filter === r ? "0.5px solid rgba(232,93,38,0.32)" : "0.5px solid rgba(255,255,255,0.08)",
                color: filter === r ? "#E85D26" : "rgba(255,255,255,0.55)",
                borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: REGION_COLORS[r], flexShrink: 0 }} />
              {r} ({DESARROLLOS.filter((d) => d.region === r).length})
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {visible.map((d) => (
            <DesarrolloCard
              key={d.slug}
              d={d}
              onClick={() => router.push(`/desarrollos/${d.slug}`)}
              onGenerate={(des: Desarrollo) =>
                setGenModal({ open: true, des: des.nombre, type: "post" })
              }
            />
          ))}
        </div>
      </div>

      <GenerateModal
        open={genModal.open}
        onClose={() => setGenModal({ open: false, des: null, type: "post" })}
        defaultDesarrollo={genModal.des}
        defaultType={genModal.type}
        toast={toast}
      />
    </>
  );
}

export default function DesarrollosPage() {
  return (
    <ToastProvider>
      <DesarrollosInner />
    </ToastProvider>
  );
}
