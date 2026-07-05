import type { TargetAndTransition, Variants } from "framer-motion";

export const motionTokens = {
  duration: {
    fast: 0.32,
    base: 0.58,
    slow: 0.92,
  },
  delay: {
    base: 0.08,
    panel: 0.28,
  },
  easing: [0.22, 1, 0.36, 1] as const,
  floating: {
    y: 10,
    duration: 6.5,
  },
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.easing,
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.easing,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: motionTokens.delay.base,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.base,
      ease: motionTokens.easing,
    },
  },
};

export const scaleInSoft: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.easing,
    },
  },
};

export const glassReveal: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.97, filter: "blur(18px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      delay: motionTokens.delay.panel,
      ease: motionTokens.easing,
    },
  },
};

export const floatSoft: TargetAndTransition = {
  y: [0, -motionTokens.floating.y, 0],
  transition: {
    duration: motionTokens.floating.duration,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
