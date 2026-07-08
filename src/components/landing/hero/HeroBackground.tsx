"use client";

import { motion } from "framer-motion";
import { sceneBackground } from "@/components/landing/hero/data/hero-scene.mock";
import { useHydrated } from "@/hooks/useHydrated";

export function HeroBackground() {
  const hydrated = useHydrated();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#17120d]"
    >
      <motion.div
        className="absolute inset-[-3%] scale-[1.04]"
        initial={hydrated ? { opacity: 0, scale: 1.08 } : false}
        animate={{ opacity: 1, scale: 1.04 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundImage: `url(${sceneBackground.image})`,
          backgroundPosition: sceneBackground.position,
          backgroundSize: "cover",
          filter: `blur(${sceneBackground.blur}) brightness(${sceneBackground.brightness}) saturate(0.94) contrast(1.02)`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{ background: sceneBackground.overlay }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,245,226,0.16),transparent_28%),radial-gradient(circle_at_53%_58%,rgba(39,119,255,0.08),transparent_42%),radial-gradient(circle_at_76%_52%,rgba(185,255,46,0.035),transparent_32%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(43,31,20,0.08)_52%,rgba(12,9,6,0.3)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/12 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#070806]/42 via-[#070806]/12 to-transparent" />
      <motion.div
        className="absolute left-1/2 top-[46%] h-[34rem] w-[58rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3dc]/14 blur-[100px]"
        initial={false}
        animate={{
          opacity: [0.28, 0.42, 0.28],
          scale: [1, 1.04, 1],
          transition: { duration: 8.5, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}
