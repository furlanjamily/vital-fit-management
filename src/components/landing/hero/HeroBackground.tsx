"use client";

import { motion } from "framer-motion";
import { sceneBackground } from "@/components/landing/hero/data/hero-scene.mock";
import { useHydrated } from "@/hooks/useHydrated";

export function HeroBackground() {
  const hydrated = useHydrated();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        initial={hydrated ? { opacity: 0, scale: 1.05 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sceneBackground.image}
          alt=""
          className="absolute inset-[-3%] h-[106%] w-[106%] max-w-none object-cover"
          style={{
            objectPosition: sceneBackground.position,
            filter: `blur(${sceneBackground.blur}) brightness(${sceneBackground.brightness}) saturate(1.05) contrast(1.04)`,
          }}
          fetchPriority="low"
        />
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_42%,rgba(255,153,60,0.12),transparent_38%)]" />
      <motion.div
        className="absolute left-[9%] top-[44%] h-[30rem] w-[22rem] -translate-y-1/2 rounded-full bg-[#fff3dc]/12 blur-[90px]"
        initial={false}
        animate={{
          opacity: [0.18, 0.32, 0.18],
          scale: [1, 1.05, 1],
          transition: { duration: 8.5, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}
