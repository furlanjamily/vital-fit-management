"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CenterDashboardPanel } from "@/components/landing/hero/panels/CenterDashboardPanel";
import { LeftSidebarPanel } from "@/components/landing/hero/panels/LeftSidebarPanel";
import { RightProfilePanel } from "@/components/landing/hero/panels/RightProfilePanel";
import { sceneMotion } from "@/components/landing/hero/motion/hero-scene.motion";
import { useHydrated } from "@/hooks/useHydrated";

/**
 * 3D stage style applied only on desktop (lg+).
 * On mobile the center panel renders flat — no perspective, no rotateY.
 */
const stageStyle = {
  perspective: "2400px",
  perspectiveOrigin: "center center",
  transformStyle: "preserve-3d" as const,
};

export function HeroScene() {
  const hydrated = useHydrated();
  const motionInitial = hydrated ? "hidden" : false;

  return (
    <main className="relative hidden min-h-svh overflow-hidden text-white lg:flex">
      <div
        className="relative z-10 flex w-full items-center justify-center gap-[clamp(14px,1.4vw,24px)] px-6 py-10"
        style={stageStyle}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[44rem] w-[72rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),rgba(255,153,60,0.06)_36%,transparent_72%)] blur-[70px]"
        />

        {/* Left plate — rotateY only, pivot on edge facing center */}
        <motion.div
          variants={sceneMotion.left}
          initial={motionInitial}
          animate="visible"
          className="relative z-10 h-[clamp(550px,75vh,800px)] w-[clamp(215px,21.5vw,330px)] shrink-0"
          style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
        >
          <LeftSidebarPanel />
        </motion.div>

        {/* Center panel */}
        <motion.div
          variants={sceneMotion.center}
          initial={motionInitial}
          animate="visible"
          className="relative z-30 shrink-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Link href="/dashboard" className="block transition hover:opacity-95">
            <CenterDashboardPanel />
          </Link>
        </motion.div>

        {/* Right plate — mirrored rotation */}
        <motion.div
          variants={sceneMotion.right}
          initial={motionInitial}
          animate="visible"
          className="relative z-20 h-[clamp(550px,75vh,820px)] w-[clamp(215px,21.5vw,330px)] shrink-0"
          style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
        >
          <RightProfilePanel />
        </motion.div>

      </div>
    </main>
  );
}
