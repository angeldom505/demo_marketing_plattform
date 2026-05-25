"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CameraIcon,
  BookOpenIcon,
  MailIcon,
  MegaphoneIcon,
  FilmIcon,
  SparklesIcon,
  CheckIcon,
  ChevronDownIcon,
  WandIcon,
  GalleryHorizontalEndIcon,
} from "lucide-react";
import {
  DESARROLLOS,
  TONOS,
  AUDIENCIAS_OPTIONS,
  CONTENT_TYPES,
  saveToHistorial,
} from "@/lib/data/desarrollos";
import type { ToastContextValue } from "./toasts";

const CONTENT_ICONS: Record<string, React.ElementType> = {
  Instagram: CameraIcon,
  Carousel: GalleryHorizontalEndIcon,
  BookOpen: BookOpenIcon,
  Mail: MailIcon,
  Megaphone: MegaphoneIcon,
  Film: FilmIcon,
};

function ConfigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", height: 38, padding: "0 12px", background: "rgba(0,0,0,0.25)", border: open ? "1px solid rgba(243,97,31,0.45)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 8, cursor: "pointer", color: value ? "white" : "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "left", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder}</span>
        <ChevronDownIcon size={13} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "rgba(36,36,36,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 4, zIndex: 50, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(14px)", maxHeight: 220, overflow: "auto" }}>
          {options.map((o) => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ width: "100%", padding: "8px 10px", textAlign: "left", background: o === value ? "rgba(243,97,31,0.12)" : "transparent", border: "none", borderRadius: 5, cursor: "pointer", color: o === value ? "#F3611F" : "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
              {o === value && <CheckIcon size={11} />}
              <span style={{ flex: 1 }}>{o}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ height: 32, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, background: active ? "rgba(243,97,31,0.14)" : "rgba(255,255,255,0.04)", border: active ? "1px solid rgba(243,97,31,0.45)" : "1px solid rgba(255,255,255,0.07)", color: active ? "#F3611F" : "rgba(255,255,255,0.7)", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

interface GenerateModalProps {
  open: boolean;
  onClose: () => void;
  defaultDesarrollo?: string | null;
  defaultType?: string;
  toast: Pick<ToastContextValue, "push">;
}

export function GenerateModal({ open, onClose, defaultDesarrollo, defaultType = "post", toast }: GenerateModalProps) {
  const [desarrollo, setDesarrollo] = useState(defaultDesarrollo || DESARROLLOS[0]?.nombre || "");
  const [type, setType] = useState(defaultType);
  const [tono, setTono] = useState("Cálido");
  const [audiencia, setAudiencia] = useState("Familia joven CDMX");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const outRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setDesarrollo(defaultDesarrollo || DESARROLLOS[0]?.nombre || "");
      setType(defaultType);
      setOutput("");
      setDone(false);
      setGenerating(false);
      setError("");
    }
  }, [open, defaultDesarrollo, defaultType]);

  const handleGenerate = async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setGenerating(true);
    setOutput("");
    setDone(false);
    setError("");

    const ct = CONTENT_TYPES.find((t) => t.id === type)?.label || "Post";
    toast.push({ type: "generating", title: "Generando", message: `${ct} para ${desarrollo}`, duration: 2200 });

    try {
      const res = await fetch("/api/agents/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: type, desarrollo, tono, audiencia, prompt }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al conectar con la IA.");
        setGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { setGenerating(false); return; }

      let accumulated = "";
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setOutput(accumulated);
        if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Error de conexión. Verifica que ANTHROPIC_API_KEY esté configurado.");
      }
    }

    setGenerating(false);
    setDone(true);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setGenerating(false);
    if (output) setDone(true);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(output);
    toast.push({ type: "success", title: "Copiado al portapapeles" });
  };

  const handleSave = () => {
    const ct = CONTENT_TYPES.find((t) => t.id === type);
    saveToHistorial({
      tipo: type,
      tipoLabel: ct?.label || type,
      desarrollo,
      tono,
      audiencia,
      output,
      channel: ct?.icon || "Instagram",
    });
    toast.push({
      type: "success",
      title: "Guardado en historial",
      message: `${desarrollo} · ${ct?.label}`,
    });
    onClose();
  };

  if (!open) return null;

  const currentType = CONTENT_TYPES.find((t) => t.id === type);
  const TypeIcon = currentType ? (CONTENT_ICONS[currentType.icon] || SparklesIcon) : SparklesIcon;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(10,10,10,0.65)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", animation: "fadeIn 200ms" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={generating ? "streamingBorder" : ""}
        style={{ width: 1080, maxWidth: "94vw", height: 720, maxHeight: "92vh", background: "rgba(28,28,28,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, boxShadow: "0 60px 120px rgba(0,0,0,0.6)", display: "grid", gridTemplateColumns: "380px 1fr", overflow: "hidden", position: "relative", animation: "modalIn 280ms cubic-bezier(.4,0,.2,1)" }}
      >
        {/* LEFT — config */}
        <div style={{ padding: "22px 22px 18px", display: "flex", flexDirection: "column", gap: 18, background: "rgba(0,0,0,0.18)", borderRight: "1px solid rgba(255,255,255,0.06)", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #F3611F, #E05A1A)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 6px 18px rgba(243,97,31,0.4)" }}>
              <WandIcon size={16} />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Generar con HU·GPT</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11.5 }}>Claude · Haiku · streaming</div>
            </div>
          </div>

          <ConfigField label="Desarrollo">
            <Select value={desarrollo} onChange={setDesarrollo} options={DESARROLLOS.map((d) => d.nombre)} placeholder="Selecciona desarrollo" />
          </ConfigField>

          <ConfigField label="Tipo de contenido">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {CONTENT_TYPES.map((ct) => {
                const CtIcon = CONTENT_ICONS[ct.icon] || SparklesIcon;
                return (
                  <button key={ct.id} onClick={() => setType(ct.id)} style={{ padding: "10px 10px", background: type === ct.id ? "rgba(243,97,31,0.14)" : "rgba(255,255,255,0.03)", border: type === ct.id ? "1px solid rgba(243,97,31,0.45)" : "1px solid rgba(255,255,255,0.06)", color: type === ct.id ? "#F3611F" : "rgba(255,255,255,0.75)", borderRadius: 7, cursor: "pointer", textAlign: "left", fontSize: 12, fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
                    <CtIcon size={14} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ct.label}</span>
                  </button>
                );
              })}
            </div>
          </ConfigField>

          <ConfigField label="Tono">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TONOS.map((t) => (
                <Pill key={t} active={tono === t} onClick={() => setTono(t)}>{t}</Pill>
              ))}
            </div>
          </ConfigField>

          <ConfigField label="Audiencia">
            <Select value={audiencia} onChange={setAudiencia} options={AUDIENCIAS_OPTIONS} placeholder="Audiencia target" />
          </ConfigField>

          <ConfigField label="Brief adicional">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: enfoque en plusvalía, mencionar lanzamiento de fase 2…"
              style={{ minHeight: 64, resize: "vertical", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, padding: "10px 12px", color: "white", fontSize: 12.5, lineHeight: 1.45, fontFamily: "inherit", outline: "none", width: "100%" }}
            />
          </ConfigField>

          <div style={{ flex: 1 }} />

          <button
            onClick={generating ? handleStop : handleGenerate}
            style={{ height: 44, background: "linear-gradient(135deg, #F3611F, #E05A1A)", border: "none", borderRadius: 9, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 10px 28px rgba(243,97,31,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}
            className="primaryBtn"
          >
            <SparklesIcon size={16} />
            {generating ? "Detener generación" : output ? "Regenerar" : "Generar contenido"}
          </button>
        </div>

        {/* RIGHT — output */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              <TypeIcon size={13} />
              <span style={{ color: "white", fontWeight: 600 }}>{currentType?.label}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span>{desarrollo}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span>{tono}</span>
            </div>
            <div style={{ flex: 1 }} />
            {generating && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#F3611F", fontSize: 11.5, fontWeight: 600 }}>
                <span className="streamDot" /> Streaming
              </div>
            )}
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }} className="iconBtn">×</button>
          </div>

          <div ref={outRef} style={{ flex: 1, overflow: "auto", padding: "24px 28px", background: "radial-gradient(circle at 80% 0%, rgba(243,97,31,0.04), transparent 50%)" }}>
            {error && (
              <div style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", fontSize: 13, lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            {!output && !generating && !error && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "rgba(255,255,255,0.4)" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(243,97,31,0.08)", border: "1px solid rgba(243,97,31,0.2)", display: "grid", placeItems: "center", color: "#F3611F" }}>
                  <SparklesIcon size={22} />
                </div>
                <div style={{ textAlign: "center", maxWidth: 320 }}>
                  <div style={{ color: "white", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Listo para generar</div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>Configura el brief y presiona &ldquo;Generar contenido&rdquo;. El output aparece aquí en tiempo real via Claude.</p>
                </div>
              </div>
            )}
            {(output || generating) && !error && (
              <pre style={{ margin: 0, color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 1.65, fontFamily: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {output}
                {generating && <span className="caret" />}
              </pre>
            )}
          </div>

          {output && !error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.18)" }}>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>
                {output.split(/\s+/).filter(Boolean).length} palabras · {output.length} chars
              </span>
              <div style={{ flex: 1 }} />
              <button onClick={onClose} style={{ height: 34, padding: "0 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", borderRadius: 7, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} className="iconBtn">Descartar</button>
              <button onClick={handleCopy} disabled={!done} style={{ height: 34, padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 7, fontSize: 12.5, fontWeight: 500, cursor: done ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: done ? 1 : 0.5 }} className="iconBtn">Copiar</button>
              <button onClick={handleSave} disabled={!done} style={{ height: 34, padding: "0 16px", background: "linear-gradient(135deg, #F3611F, #E05A1A)", border: "none", color: "white", borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: done ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: done ? 1 : 0.5, display: "inline-flex", alignItems: "center", gap: 6, boxShadow: done ? "0 6px 18px rgba(243,97,31,0.4)" : "none" }} className="primaryBtn">
                <CheckIcon size={13} />
                Guardar en historial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
