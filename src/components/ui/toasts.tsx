"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  CheckIcon,
  SparklesIcon,
  BellIcon,
  CircleIcon,
} from "lucide-react";

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastItem {
  id: number;
  type: "success" | "error" | "generating" | "info";
  title?: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastContextValue {
  push: (t: Omit<ToastItem, "id">) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  push: () => 0,
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);

const TYPE_CONFIG = {
  success: {
    color: "#34D399",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.32)",
    Icon: CheckIcon,
  },
  error: {
    color: "#F87171",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.32)",
    Icon: CircleIcon,
  },
  generating: {
    color: "#F3611F",
    bg: "rgba(243,97,31,0.10)",
    border: "rgba(243,97,31,0.32)",
    Icon: SparklesIcon,
  },
  info: {
    color: "#94A3B8",
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    Icon: BellIcon,
  },
};

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const Icon = cfg.Icon;
  return (
    <div
      className="toast"
      style={{
        pointerEvents: "auto",
        minWidth: 320,
        maxWidth: 380,
        background: "rgba(35,35,35,0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className={toast.type === "generating" ? "pulsing" : ""}
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: cfg.bg,
          color: cfg.color,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          border: `1px solid ${cfg.border}`,
        }}
      >
        <Icon size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        {toast.title && (
          <div style={{ color: "white", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, lineHeight: 1.4 }}>
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick?.();
              onDismiss();
            }}
            style={{
              marginTop: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: cfg.color,
              fontSize: 12,
              fontWeight: 600,
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            {toast.action.label} →
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.4)",
          fontSize: 16,
          lineHeight: 1,
          padding: 2,
          fontFamily: "inherit",
        }}
      >
        ×
      </button>
      {(toast.duration ?? 4000) > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            background: cfg.color,
            animation: `toastBar ${toast.duration ?? 4000}ms linear forwards`,
            opacity: 0.7,
          }}
        />
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<ToastItem, "id">): number => {
      const id = ++idRef.current;
      const toast: ToastItem = { ...t, id, type: t.type ?? "info", duration: t.duration ?? 4000 };
      setToasts((ts) => [...ts, toast]);
      const dur = toast.duration ?? 4000;
      if (dur > 0) {
        setTimeout(() => dismiss(id), dur);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 22,
          right: 22,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
