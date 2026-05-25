"use client";
import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";
import { T } from "@/styles/tokens";

export interface GlobeMarker {
  location: [number, number];
  size: number;
  label?: string;
}

export interface GlobeProps {
  size?: number;
  markers?: GlobeMarker[];
}

const DEFAULT_MARKERS: GlobeMarker[] = [
  { location: [19.3910, -99.1713], size: 0.05 },
  { location: [20.6296, -87.0739], size: 0.045 },
  { location: [19.0414, -98.2063], size: 0.04 },
  { location: [19.6010, -99.0300], size: 0.038 },
  { location: [19.4820, -99.1191], size: 0.036 },
  { location: [19.3557, -99.0629], size: 0.03 },
  { location: [20.6597, -103.3496], size: 0.03 },
  { location: [19.5400, -99.1950], size: 0.028 },
  { location: [19.6252, -99.1014], size: 0.026 },
  { location: [19.6460, -99.1710], size: 0.025 },
];

export function Globe({ size = 340, markers }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Globe state refs (mutable, no re-render needed)
  const phiRef    = useRef(0);
  const thetaRef  = useRef(0.3);
  const scaleRef  = useRef(1.0);
  const rafRef    = useRef<number>(0);
  const globeRef  = useRef<ReturnType<typeof createGlobe> | null>(null);

  // Interaction state
  const isDraggingRef    = useRef(false);
  const lastXRef         = useRef(0);
  const lastYRef         = useRef(0);
  const autoRotateRef    = useRef(true);
  const resumeTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPinchDistRef = useRef<number | null>(null);

  const resumeAutoRotate = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      autoRotateRef.current = true;
    }, 2000);
  }, []);

  // Globe init + animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2);
    const activeMarkers = (markers ?? DEFAULT_MARKERS).map(m => ({
      location: m.location,
      size:     m.size,
    }));

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width:            size * dpr,
      height:           size * dpr,
      phi:              phiRef.current,
      theta:            thetaRef.current,
      dark:             1,
      diffuse:          1.0,
      mapSamples:       20000,
      mapBrightness:    5.5,
      baseColor:        [0.04, 0.05, 0.08],
      markerColor:      [0.12, 0.62, 0.46],
      glowColor:        [0.91, 0.36, 0.15],
      scale:            scaleRef.current,
      markers:          activeMarkers,
    });

    globeRef.current = globe;

    const animate = () => {
      if (autoRotateRef.current) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi:   phiRef.current,
        theta: thetaRef.current,
        scale: scaleRef.current,
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      globe.destroy();
      globeRef.current = null;
    };
  }, [size, markers]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      canvas.style.cursor = "grabbing";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      phiRef.current  += dx * 0.005;
      thetaRef.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, thetaRef.current - dy * 0.005)
      );
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      canvas.style.cursor = "grab";
      resumeAutoRotate();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      autoRotateRef.current = false;
      const delta = e.deltaY * 0.001;
      scaleRef.current = Math.max(0.5, Math.min(3.0, scaleRef.current - delta));
      resumeAutoRotate();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [resumeAutoRotate]);

  // Touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      autoRotateRef.current = false;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastXRef.current = e.touches[0].clientX;
        lastYRef.current = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      }
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - lastXRef.current;
        const dy = e.touches[0].clientY - lastYRef.current;
        lastXRef.current = e.touches[0].clientX;
        lastYRef.current = e.touches[0].clientY;
        phiRef.current  += dx * 0.005;
        thetaRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, thetaRef.current - dy * 0.005)
        );
      } else if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = (dist - lastPinchDistRef.current) * 0.005;
        scaleRef.current = Math.max(0.5, Math.min(3.0, scaleRef.current + delta));
        lastPinchDistRef.current = dist;
      }
      e.preventDefault();
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      lastPinchDistRef.current = null;
      resumeAutoRotate();
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [resumeAutoRotate]);

  const zoomIn  = () => { scaleRef.current = Math.min(3.0, scaleRef.current + 0.2); };
  const zoomOut = () => { scaleRef.current = Math.max(0.5, scaleRef.current - 0.2); };

  return (
    <div style={{ position: "relative", width: size, height: size, userSelect: "none" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: size, height: size,
          borderRadius: "50%",
          opacity: 0.92,
          cursor: "grab",
          display: "block",
        }}
      />

      {/* Zoom controls */}
      <div style={{
        position: "absolute", bottom: 10, right: 10,
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        {([{ label: "+", fn: zoomIn }, { label: "−", fn: zoomOut }]).map(({ label, fn }) => (
          <button
            key={label}
            onClick={fn}
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: "rgba(15,17,23,0.85)",
              border: `0.5px solid ${T.borderDefault}`,
              color: T.textSecondary,
              fontSize: 14, lineHeight: 1,
              cursor: "pointer",
              display: "grid", placeItems: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: -22, left: "50%",
        transform: "translateX(-50%)",
        fontSize: 9, color: T.textGhost,
        whiteSpace: "nowrap",
        fontFamily: '"DM Sans", sans-serif',
        letterSpacing: "0.04em",
      }}>
        Arrastra para rotar · Scroll para zoom
      </div>
    </div>
  );
}
