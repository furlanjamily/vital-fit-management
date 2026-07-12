"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CenterPanelShell } from "@/components/app/CenterPanelShell";
import { LeftSidebarPanel } from "@/components/landing/hero/panels/LeftSidebarPanel";
import { RightProfilePanel } from "@/components/landing/hero/panels/RightProfilePanel";
import { sceneMotion } from "@/components/landing/hero/motion/hero-scene.motion";
import { useHydrated } from "@/hooks/useHydrated";

const stageStyle = {
  perspective: "2400px",
  perspectiveOrigin: "center center",
  transformStyle: "preserve-3d" as const,
};

type DesktopAppShellProps = {
  children: React.ReactNode;
};

export function DesktopAppShell({ children }: DesktopAppShellProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const shellInitial = hydrated ? "hidden" : false;
  const centerInitial = hydrated ? "hidden" : false;

  return (
    <main className="relative hidden min-h-svh overflow-hidden text-white lg:flex">
      <div
        className="relative z-10 flex w-full items-center justify-center gap-[clamp(14px,1.4vw,24px)] px-6 py-10"
        style={stageStyle}
      >
        <motion.div
          variants={sceneMotion.left}
          initial={shellInitial}
          animate="visible"
          className="relative z-10 h-[clamp(550px,75vh,800px)] w-[clamp(215px,21.5vw,330px)] shrink-0"
          style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
        >
          <LeftSidebarPanel />
        </motion.div>

        <motion.div
          key={pathname}
          variants={sceneMotion.center}
          initial={centerInitial}
          animate="visible"
          className="relative z-30 shrink-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <CenterPanelShell>{children}</CenterPanelShell>
        </motion.div>

        <motion.div
          variants={sceneMotion.right}
          initial={shellInitial}
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
