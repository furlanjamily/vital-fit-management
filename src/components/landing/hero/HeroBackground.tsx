"use client";

import { motion } from "framer-motion";
import { sceneBackground } from "@/components/landing/hero/data/hero-scene.mock";
import { useHydrated } from "@/hooks/useHydrated";

/**
 * Fundo global alinhado à landing VitalFit:
 * base quase preta + fumaça âmbar cinematográfica (não amarelo lavado).
 */
export function HeroBackground() {
  const hydrated = useHydrated();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#070402]"
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
            filter: `blur(${sceneBackground.blur}) brightness(${sceneBackground.brightness}) saturate(${sceneBackground.saturate}) contrast(${sceneBackground.contrast})`,
          }}
          fetchPriority="low"
        />
      </motion.div>

      {/* Escurece bordas / base — tom da landing (carvão quente) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(7,4,2,0.55)_70%,rgba(7,4,2,0.88)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/50" />

      {/* Fumaça âmbar concentrada — sutil, sem cast amarelo no centro */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(255,122,0,0.14),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(255,153,60,0.06),transparent_36%)]" />

      <motion.div
        className="absolute left-[8%] top-[42%] h-[28rem] w-[20rem] -translate-y-1/2 rounded-full bg-[#fff3dc]/5 blur-[100px]"
        initial={false}
        animate={{
          opacity: [0.06, 0.11, 0.06],
          scale: [1, 1.03, 1],
          transition: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}
