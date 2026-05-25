"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_EMAIL    = "demo@portafolio.com";
const DEMO_PASSWORD = "sonrie1234";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      router.push("/dashboard");
    } else {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#060810",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"DM Sans", "Geist", system-ui, sans-serif',
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Orb 1 — naranja */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(243,97,31,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Orb 2 — violeta */}
      <div style={{
        position: "fixed", bottom: "-15%", left: "-8%",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Orb 3 — azul tenue */}
      <div style={{
        position: "fixed", top: "40%", left: "30%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 80%)",
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        padding: "40px 24px 60px",
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: "linear-gradient(135deg, #F3611F 0%, #7C3AED 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 40px rgba(243,97,31,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          }}>
            <span style={{ color: "white", fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em" }}>N</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{
            margin: "0 0 8px",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.6) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Nexus Suite
          </h1>
          <p style={{
            margin: 0, color: "rgba(255,255,255,0.38)",
            fontSize: 13.5, lineHeight: 1.5,
            letterSpacing: "0.01em",
          }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Card */}
        <div style={{
          width: "100%",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "28px 28px 32px",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase", letterSpacing: "0.09em",
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="demo@portafolio.com"
                style={{
                  width: "100%", padding: "12px 14px",
                  background: focused === "email" ? "rgba(243,97,31,0.06)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${focused === "email" ? "rgba(243,97,31,0.5)" : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 12, color: "white", fontSize: 14,
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  transition: "all 200ms",
                  boxShadow: focused === "email" ? "0 0 0 3px rgba(243,97,31,0.1)" : "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase", letterSpacing: "0.09em",
              }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("pass")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 14px",
                  background: focused === "pass" ? "rgba(243,97,31,0.06)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${focused === "pass" ? "rgba(243,97,31,0.5)" : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 12, color: "white", fontSize: 14,
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  transition: "all 200ms",
                  boxShadow: focused === "pass" ? "0 0 0 3px rgba(243,97,31,0.1)" : "none",
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: "11px 14px",
                background: "rgba(192,57,43,0.1)",
                border: "1px solid rgba(192,57,43,0.3)",
                borderRadius: 10, fontSize: 13, color: "#F87171",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6, width: "100%", padding: "13px",
                background: loading
                  ? "rgba(243,97,31,0.4)"
                  : "linear-gradient(135deg, #F3611F 0%, #C94A12 100%)",
                border: "none", borderRadius: 12,
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em", fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 6px 28px rgba(243,97,31,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition: "all 200ms",
              }}
            >
              {loading ? "Verificando…" : "Entrar"}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, width: "100%", padding: "13px 16px",
          background: "rgba(124,58,237,0.07)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 12, textAlign: "center",
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: '"IBM Plex Mono", monospace', textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Acceso demo
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.5)", fontFamily: '"IBM Plex Mono", monospace' }}>
            demo@portafolio.com · sonrie1234
          </p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 36, opacity: 0.2, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, #F3611F, #7C3AED)", display: "grid", placeItems: "center" }}>
            <span style={{ color: "white", fontSize: 9, fontWeight: 800 }}>N</span>
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: '"IBM Plex Mono", monospace' }}>
            Nexus Suite © 2026
          </span>
        </div>
      </div>
    </main>
  );
}
