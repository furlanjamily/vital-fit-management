import type { Variants } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Lateral panels are flat rigid plates: rotateY only.
 * No rotateX / rotateZ / translateZ — those were causing the "pill" distortion.
 * The vanishing point lives on the stage container (perspective: 2200px).
 */
const LEFT_ROTATE_Y = "60deg";
const RIGHT_ROTATE_Y = "-60deg";

export const sceneMotion = {
  center: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      transform: "translate3d(0px, 26px, 0px) scale(0.97)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transform: "translate3d(0px, 0px, 0px) scale(1)",
      transition: { duration: 0.86, ease },
    },
  },
  left: {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
      transform: `translate3d(-64px, 0px, 0px) rotateY(30deg)`,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transform: `translate3d(0px, 0px, 0px) rotateY(${LEFT_ROTATE_Y})`,
      transition: { duration: 0.82, delay: 0.28, ease },
    },
  },
  right: {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
      transform: `translate3d(64px, 0px, 0px) rotateY(-30deg)`,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transform: `translate3d(0px, 0px, 0px) rotateY(${RIGHT_ROTATE_Y})`,
      transition: { duration: 0.82, delay: 0.46, ease },
    },
  },
  modal: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      transform: "translate3d(0px, 34px, 80px) scale(0.96)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transform: "translate3d(0px, 0px, 150px) scale(1)",
      transition: { duration: 0.72, delay: 0.68, ease },
    },
  },
} satisfies Record<string, Variants>;

export const ambientFloat = {
  y: [0, -5, 0],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
