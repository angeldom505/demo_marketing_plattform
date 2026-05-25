"use client";

import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  CameraIcon, ChevronLeftIcon, ChevronRightIcon,
  LinkIcon, MailIcon, SparklesIcon,
} from "lucide-react";
import { T } from "@/styles/tokens";

const MONO = '"IBM Plex Mono", monospace';
const SANS = '"DM Sans", sans-serif';

const ADMIN_EMAIL = "adominguez@hogaresunion.mx";

// ── Equipo ────────────────────────────────────────────────────────────────────

const TEAM = [
  {
    id: "angel",
    nombre: "Angel Domínguez",
    puesto: "Data Manager ",
    area: "Data Innovation",
    email: "adominguez@hogaresunion.mx",
    bio: "Estrategia digital, performance e innovación con IA para los desarrollos de Hogares Unión.",
    color: T.orange,
    initials: "AD",
    linkedIn: "#",
  },
  {
    id: "diana",
    nombre: "Diana Cruz",
    puesto: "Coordinadora Conversion",
    area: "Conversion",
    email: "dcruz@hogaresunion.mx",
    bio: "Estrategia de conversion por desarrollos.",
    color: T.teal,
    initials: "RC",
    linkedIn: "#",
  },
  {
    id: "generico",
    nombre: "generico",
    puesto: "Coordinador Paid Media",
    area: "Paid Media",
    email: "@hogaresunion.mx",
    bio: "Campañas de performance en Meta Ads y Google. CPL optimizado, ROAS medible por desarrollo.",
    color: T.blue,
    initials: "CM",
    linkedIn: "#",
  },
  {
    id: "ale",
    nombre: "Alejandra Belmont",
    puesto: "Coordinadora Creativa",
    area: "Diseño",
    email: "abelmont@hogaresunion.mx",
    bio: "Identidad visual de desarrollos, assets digitales, briefs creativos y brand guidelines.",
    color: T.purple,
    initials: "SR",
    linkedIn: "#",
  },
  {
    id: "Alan",
    nombre: "Alan",
    puesto: "Social Media Manager",
    area: "Social Media",
    email: "aestrada@hogaresunion.mx",
    bio: "Parrilla editorial, comunidad y estrategia orgánica en Instagram, Facebook y TikTok.",
    color: "#C47F1A",
    initials: "MT",
    linkedIn: "#",
  },
  {
    id: "generico",
    nombre: "generico",
    puesto: "generico",
    area: "generico",
    email: "-@hogaresunion.mx",
    bio: "Dashboard de KPIs, atribución de leads y reportes ejecutivos de performance comercial.",
    color: "#6B87A1",
    initials: "AL",
    linkedIn: "#",
  },
];

// ── Position math ─────────────────────────────────────────────────────────────

function getCardStyle(pos: number): React.CSSProperties {
  const abs = Math.abs(pos);
  if (abs > 2) return { display: "none" };

  const scale   = pos === 0 ? 1 : abs === 1 ? 0.78 : 0.60;
  const opacity = pos === 0 ? 1 : abs === 1 ? 0.55 : 0.22;
  const tx      = pos === 0 ? 0 : pos < 0 ? -52 * abs : 52 * abs;
  const zIndex  = pos === 0 ? 10 : abs === 1 ? 5 : 1;
  const blur    = pos === 0 ? 0 : abs === 1 ? 0 : 2;

  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) translateX(${tx}%) scale(${scale})`,
    opacity,
    zIndex,
    filter: blur ? `blur(${blur}px)` : "none",
    transition: "transform 480ms cubic-bezier(.4,0,.2,1), opacity 480ms, filter 480ms",
    cursor: pos !== 0 ? "pointer" : "default",
    willChange: "transform, opacity",
  };
}

// ── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  member: typeof TEAM[0];
  pos: number;
  isAdmin: boolean;
  photoUrl: string | null;
  onUpload: (id: string) => void;
  onClick: () => void;
}

function MemberCard({ member, pos, isAdmin, photoUrl, onUpload, onClick }: CardProps) {
  const isCenter = pos === 0;
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={getCardStyle(pos)}
      onClick={!isCenter ? onClick : undefined}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div style={{
        width: 320,
        background: isCenter
          ? `linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`
          : "rgba(255,255,255,0.03)",
        border: isCenter
          ? `0.5px solid rgba(255,255,255,0.14)`
          : "0.5px solid rgba(255,255,255,0.06)",
        borderRadius: 24,
        padding: "36px 28px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        boxShadow: isCenter
          ? "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
          : "none",
        backdropFilter: isCenter ? "blur(20px)" : "none",
        WebkitBackdropFilter: isCenter ? "blur(20px)" : "none",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Accent glow top */}
        {isCenter && (
          <div style={{
            position: "absolute",
            top: -60, left: "50%", transform: "translateX(-50%)",
            width: 180, height: 180,
            background: `radial-gradient(circle, ${member.color}25, transparent 70%)`,
            pointerEvents: "none",
          }} />
        )}

        {/* Color bar top */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${member.color}, transparent)`,
          opacity: isCenter ? 0.7 : 0.3,
        }} />

        {/* Photo */}
        <div style={{ position: "relative", marginBottom: 22 }}>
          <div style={{
            width: isCenter ? 120 : 96,
            height: isCenter ? 120 : 96,
            borderRadius: "50%",
            overflow: "hidden",
            border: isCenter
              ? `2.5px solid ${member.color}60`
              : `1.5px solid rgba(255,255,255,0.1)`,
            background: `linear-gradient(135deg, ${member.color}25, ${member.color}10)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "width 300ms, height 300ms, border 300ms",
            flexShrink: 0,
            position: "relative",
          }}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={member.nombre}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span style={{
                fontSize: isCenter ? 36 : 28,
                fontWeight: 700,
                color: member.color,
                fontFamily: SANS,
                letterSpacing: "-0.02em",
                userSelect: "none",
                transition: "font-size 300ms",
              }}>
                {member.initials}
              </span>
            )}

            {/* Upload overlay — admin only, center card only */}
            {isCenter && isAdmin && (
              <div
                onClick={() => onUpload(member.id)}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  opacity: hovering ? 1 : 0,
                  transition: "opacity 200ms",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                <CameraIcon size={22} color="white" />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Subir foto
                </span>
              </div>
            )}
          </div>

          {/* Online dot */}
          {isCenter && (
            <div style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: T.teal,
              border: "2px solid rgba(12,14,20,0.95)",
              boxShadow: `0 0 10px ${T.teal}60`,
            }} />
          )}
        </div>

        {/* Info */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h3 style={{
            margin: "0 0 6px",
            color: "white",
            fontSize: isCenter ? 20 : 16,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            fontFamily: SANS,
            lineHeight: 1.2,
            transition: "font-size 300ms",
          }}>
            {member.nombre}
          </h3>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            background: `${member.color}15`,
            border: `0.5px solid ${member.color}40`,
            borderRadius: 20,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 11, color: member.color, fontWeight: 600, fontFamily: SANS }}>
              {member.area}
            </span>
          </div>

          <p style={{
            margin: 0,
            fontSize: 12,
            color: "rgba(255,255,255,0.48)",
            fontFamily: SANS,
            lineHeight: 1.55,
          }}>
            {member.puesto}
          </p>
        </div>

        {/* Bio — only center */}
        {isCenter && (
          <>
            <div style={{
              width: "100%",
              borderTop: "0.5px solid rgba(255,255,255,0.07)",
              paddingTop: 16,
              marginBottom: 20,
            }}>
              <p style={{
                margin: 0,
                fontSize: 12.5,
                color: "rgba(255,255,255,0.55)",
                fontFamily: SANS,
                lineHeight: 1.65,
                textAlign: "center",
              }}>
                {member.bio}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`mailto:${member.email}`}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 11,
                  fontFamily: SANS,
                  fontWeight: 500,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <MailIcon size={12} />
                Contactar
              </a>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                background: `${member.color}10`,
                border: `0.5px solid ${member.color}30`,
                borderRadius: 10,
                cursor: "pointer",
              }}>
                <SparklesIcon size={12} color={member.color} />
                <span style={{ fontSize: 11, color: member.color, fontFamily: SANS, fontWeight: 500 }}>
                  Generar contenido
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function EquipoPage() {
  const [active, setActive]         = useState(0);
  const [photos, setPhotos]         = useState<Record<string, string | null>>({});
  const [uploading, setUploading]   = useState<string | null>(null);
  const [userEmail, setUserEmail]   = useState<string | null>(null);
  const [paused, setPaused]         = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);
  const uploadTarget                = useRef<string | null>(null);
  const supabase                    = createClient();
  const isAdmin                     = userEmail === ADMIN_EMAIL;

  // Get user email
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  // Load photos from Supabase Storage
  useEffect(() => {
    const load = async () => {
      const map: Record<string, string | null> = {};
      for (const m of TEAM) {
        try {
          const { data } = supabase.storage
            .from("equipo")
            .getPublicUrl(`${m.id}.jpg`);
          // verify it exists with a HEAD request
          const res = await fetch(data.publicUrl, { method: "HEAD" });
          map[m.id] = res.ok ? data.publicUrl : null;
        } catch {
          map[m.id] = null;
        }
      }
      setPhotos(map);
    };
    load();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive(a => (a + 1) % TEAM.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = useCallback(() => {
    setPaused(true);
    setActive(a => (a - 1 + TEAM.length) % TEAM.length);
  }, []);

  const next = useCallback(() => {
    setPaused(true);
    setActive(a => (a + 1) % TEAM.length);
  }, []);

  const goTo = (i: number) => {
    setPaused(true);
    setActive(i);
  };

  // Upload handler
  const handleUploadClick = (memberId: string) => {
    uploadTarget.current = memberId;
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id   = uploadTarget.current;
    if (!file || !id) return;

    setUploading(id);
    try {
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `${id}.${ext}`;

      const { error } = await supabase.storage
        .from("equipo")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from("equipo").getPublicUrl(path);
      setPhotos(prev => ({ ...prev, [id]: data.publicUrl + `?t=${Date.now()}` }));
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 80px",
        fontFamily: SANS,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* Background ambient glow */}
      <div style={{
        position: "absolute",
        top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 700,
        background: `radial-gradient(circle, ${TEAM[active].color}0D, transparent 65%)`,
        pointerEvents: "none",
        transition: "background 600ms",
        zIndex: 0,
      }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56, zIndex: 1, position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px",
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          marginBottom: 16,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: MONO, letterSpacing: "0.08em" }}>
            {TEAM.length} miembros · Marketing HU
          </span>
        </div>
        <h1 style={{
          margin: "0 0 10px",
          color: "white",
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          fontFamily: SANS,
          lineHeight: 1.1,
        }}>
          El equipo
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: SANS, lineHeight: 1.6 }}>
          Las personas detrás de la estrategia de marketing de Hogares Unión
        </p>
      </div>

      {/* Carousel stage */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 900,
          height: 540,
          zIndex: 1,
        }}
      >
        {TEAM.map((member, i) => {
          let pos = i - active;
          // wrap around
          if (pos >  TEAM.length / 2) pos -= TEAM.length;
          if (pos < -TEAM.length / 2) pos += TEAM.length;

          return (
            <MemberCard
              key={member.id}
              member={member}
              pos={pos}
              isAdmin={isAdmin}
              photoUrl={uploading === member.id ? null : (photos[member.id] ?? null)}
              onUpload={handleUploadClick}
              onClick={() => goTo(i)}
            />
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 32, zIndex: 2, position: "relative" }}>
        <button
          onClick={prev}
          style={{
            width: 44, height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            display: "grid", placeItems: "center",
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          <ChevronLeftIcon size={18} />
        </button>

        {/* Dots */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {TEAM.map((m, i) => (
            <button
              key={m.id}
              onClick={() => goTo(i)}
              style={{
                width: i === active ? 24 : 7,
                height: 7,
                borderRadius: 4,
                background: i === active ? TEAM[active].color : "rgba(255,255,255,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 350ms cubic-bezier(.4,0,.2,1)",
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          style={{
            width: 44, height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)",
            display: "grid", placeItems: "center",
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>

      {/* Name hint below dots */}
      <div style={{ marginTop: 20, zIndex: 2, textAlign: "center" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: SANS }}>
          {TEAM[active].nombre}
          <span style={{ color: "rgba(255,255,255,0.18)", margin: "0 8px" }}>·</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            {TEAM[active].puesto}
          </span>
        </span>
      </div>

      {/* Admin hint */}
      {isAdmin && (
        <div style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: `${T.orange}12`,
          border: `0.5px solid ${T.orange}35`,
          borderRadius: 20,
          zIndex: 20,
        }}>
          <CameraIcon size={12} color={T.orange} />
          <span style={{ fontSize: 11, color: T.orange, fontFamily: SANS, fontWeight: 500 }}>
            Pasa el cursor sobre la foto para subir imagen
          </span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
