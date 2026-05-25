export const T = {
  // Fondos
  bgCanvas:      "#090b0f",
  bgPanel:       "#0f1117",
  bgPanelHover:  "#141720",
  bgSubtle:      "#1a1d27",
  bgOverlay:     "#1f2333",

  // Bordes
  borderFaint:    "rgba(255,255,255,0.05)",
  borderDefault:  "rgba(255,255,255,0.08)",
  borderEmphasis: "rgba(255,255,255,0.14)",
  borderFocus:    "rgba(232,93,38,0.5)",

  // Textos
  textPrimary:   "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted:     "rgba(255,255,255,0.32)",
  textGhost:     "rgba(255,255,255,0.16)",

  // Acento corporativo HU
  orange:        "#E85D26",
  orangeBg:      "rgba(232,93,38,0.10)",
  orangeBd:      "rgba(232,93,38,0.25)",

  // Señales semánticas
  purple:        "#7F77DD",
  purpleBg:      "rgba(127,119,221,0.10)",
  teal:          "#1D9E75",
  tealBg:        "rgba(29,158,117,0.10)",
  blue:          "#4A90D9",
  blueBg:        "rgba(74,144,217,0.10)",
  amber:         "#C47F1A",
  amberBg:       "rgba(196,127,26,0.10)",
  red:           "#C0392B",
  redBg:         "rgba(192,57,43,0.10)",

  // Radios
  radiusSm: "6px",
  radiusMd: "10px",
  radiusLg: "14px",
  radiusXl: "18px",

  // Sombra (solo tooltips / flotantes)
  shadowFloat: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
} as const;

// Paleta para charts (máx 6, en orden de preferencia)
export const PALETTE = [T.purple, T.teal, T.orange, T.blue, T.amber, T.red] as const;
