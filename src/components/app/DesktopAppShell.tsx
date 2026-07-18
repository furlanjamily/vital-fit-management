"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { CenterPanelShell } from "@/components/app/CenterPanelShell";
import { DashboardRightSidebarPanel } from "@/components/dashboard/right-sidebar/DashboardRightSidebarPanel";
import { LeftSidebarPanel } from "@/components/landing/hero/panels/LeftSidebarPanel";
import { sceneMotion } from "@/components/landing/hero/motion/hero-scene.motion";
import { useHydrated } from "@/hooks/useHydrated";

const stageStyle = {
  perspective: "2400px",
  perspectiveOrigin: "center center",
  transformStyle: "preserve-3d" as const,
};

// CORREÇÃO: O 'as const' força o TypeScript a inferir o tipo literal ("tween") exigido pelo Framer Motion
const fastNavigationTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.3,
} as const;

type DesktopAppShellProps = {
  children: React.ReactNode;
};

export function DesktopAppShell({ children }: DesktopAppShellProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  
  const leftControls = useAnimationControls();
  const rightControls = useAnimationControls();
  
  const [isFirstLayoutMount, setIsFirstLayoutMount] = useState(true);

  const shellInitial = hydrated ? "hidden" : false;
  const centerInitial = hydrated ? "hidden" : false;

  useEffect(() => {
    if (isFirstLayoutMount) {
      leftControls.start("visible");
      rightControls.start("visible");
      setIsFirstLayoutMount(false);
    } else {
      // Painel Esquerdo
      leftControls.set({ rotateY: 65, x: -40, z: -150, opacity: 0 });
      leftControls.start({
        ...sceneMotion.left?.visible,
        transition: fastNavigationTransition,
      });

      // Painel Direito
      rightControls.set({ rotateY: -65, x: 40, z: -150, opacity: 0 });
      rightControls.start({
        ...sceneMotion.right?.visible,
        transition: fastNavigationTransition,
      });
    }
  }, [pathname, leftControls, rightControls, isFirstLayoutMount]);

  return (
    <main className="relative hidden min-h-svh overflow-hidden text-white lg:flex">
      <div
        className="relative z-10 flex w-full items-center justify-center gap-[clamp(14px,1.4vw,24px)] px-6 py-10"
        style={stageStyle}
      >
        {/* Painel Lateral Esquerdo */}
        <motion.div
          variants={sceneMotion.left}
          initial={shellInitial}
          animate={leftControls}
          className="relative z-10 h-[clamp(550px,75vh,800px)] w-[clamp(215px,21.5vw,330px)] shrink-0"
          style={{ 
            transformOrigin: "right center", 
            transformStyle: "preserve-3d",
            willChange: "transform, opacity"
          }}
        >
          <LeftSidebarPanel />
        </motion.div>

        {/* Painel Central */}
        <motion.div
          key={pathname}
          variants={sceneMotion.center}
          initial={centerInitial}
          animate="visible"
          className="relative z-30 shrink-0"
          style={{ 
            transformStyle: "preserve-3d",
            willChange: "transform, opacity"
          }}
        >
          <CenterPanelShell>{children}</CenterPanelShell>
        </motion.div>

        {/* Painel Lateral Direito */}
        <motion.div
          variants={sceneMotion.right}
          initial={shellInitial}
          animate={rightControls}
          className="relative z-20 h-[clamp(550px,75vh,820px)] w-[clamp(240px,22vw,340px)] shrink-0"
          style={{ 
            transformOrigin: "left center", 
            transformStyle: "preserve-3d",
            willChange: "transform, opacity"
          }}
        >
          <DashboardRightSidebarPanel />
        </motion.div>
      </div>
    </main>
  );
}