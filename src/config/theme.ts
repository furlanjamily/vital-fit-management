export const theme = {
  radius: {
    pill: "999px",
    card: "28px",
    panel: "36px",
    soft: "20px",
  },
  container: {
    max: "1180px",
    wide: "1320px",
  },
  spacing: {
    pageX: "clamp(1rem, 4vw, 3rem)",
    heroY: "clamp(5rem, 9vw, 8rem)",
  },
  glass: {
    blur: {
      subtle: "18px",
      default: "28px",
      strong: "42px",
    },
    opacity: {
      subtle: 0.08,
      default: 0.13,
      strong: 0.2,
    },
    border: "rgba(255, 255, 255, 0.22)",
    highlight: "rgba(255, 255, 255, 0.34)",
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.63)",
      tertiary: "rgba(255, 255, 255, 0.47)",
      placeholder: "rgba(255, 255, 255, 0.45)",
    },
  },
  shadow: {
    panel: "0 40px 120px rgba(0, 0, 0, 0.48)",
    card: "0 22px 70px rgba(0, 0, 0, 0.34)",
    glow: "0 0 68px rgba(255, 122, 0, 0.28)",
  },
  colors: {
    background: "transparent",
    surface: "rgba(255, 255, 255, 0.08)",
    text: "#f7f7f2",
    muted: "#b7bbb3",
    soft: "#777d73",
    accent: "#FF7A00",
    accentSoft: "#FFB300",
    kinetic: "#FF9800",
  },
  overlay: {
    dark: 0.74,
    vignette: 0.8,
    panel: 0.52,
  },
  glow: {
    low: 0.18,
    medium: 0.34,
    high: 0.5,
  },
} as const;
