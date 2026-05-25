"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router  = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0c0e14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"DM Sans", "Geist", system-ui, sans-serif',
      overflowY: "auto",
      position: "relative",
    }}>

      {/* Radial glow top-right */}
      <div style={{
        position: "fixed", top: -300, right: -200,
        width: 700, height: 700,
        background: "radial-gradient(circle, rgba(243,97,31,0.13), transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Radial glow bottom-left */}
      <div style={{
        position: "fixed", bottom: -200, left: -200,
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(243,97,31,0.06), transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Subtle grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        padding: "40px 24px 60px",
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 36 }}>
          <Image
            src="/logo-hu.png"
            alt="Hogares Unión"
            width={96}
            height={96}
            style={{ objectFit: "contain", borderRadius: 16 }}
            priority
          />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            color: "white",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
          }}>
            HU Marketing Suite
          </h1>
          <p style={{
            margin: "8px 0 0",
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            lineHeight: 1.5,
          }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Card */}
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.035)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "28px 28px 32px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="email" style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@hogaresunion.mx"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(243,97,31,0.7)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="password" style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(243,97,31,0.7)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(192,57,43,0.12)",
                border: "0.5px solid rgba(192,57,43,0.35)",
                borderRadius: 8,
                fontSize: 13,
                color: "#F87171",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "13px",
                background: loading
                  ? "rgba(243,97,31,0.45)"
                  : "linear-gradient(135deg, #F3611F, #E05A1A)",
                border: "none",
                borderRadius: 10,
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
                fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 4px 20px rgba(243,97,31,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                transition: "all 150ms",
              }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 32,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: 0.28,
        }}>
          {/* Isotipo inline */}
          <svg width="18" height="10" viewBox="0 0 22 12" fill="none" aria-hidden="true">
            <defs>
              <radialGradient id="li-o" cx="35%" cy="28%" r="65%">
                <stop offset="0%" stopColor="rgba(232,93,38,0.5)" />
                <stop offset="100%" stopColor="rgba(232,93,38,0)" />
              </radialGradient>
            </defs>
            <circle cx="5" cy="6" r="4" fill="url(#li-o)" stroke="rgba(232,93,38,0.7)" strokeWidth="1" />
            <line x1="9" y1="6" x2="13" y2="6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
            <rect x="13" y="2" width="8" height="8" rx="1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          </svg>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: '"IBM Plex Mono", monospace' }}>
            Hogares Unión © 2026
          </span>
        </div>
      </div>
    </main>
  );
}
