"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, type Transition, type Variants } from "framer-motion";
import { useHydrated } from "@/hooks/useHydrated";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DESKTOP_MQ = "(min-width: 1024px)";
const FIRST_LOAD_KEY = "vitalfit_first_load";

const stageStyle = {
  perspective: "1200px",
  transformStyle: "preserve-3d" as const,
};

const gpuLayerStyle = {
  willChange: "transform, opacity",
  transformStyle: "preserve-3d" as const,
} as const;

const navTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.3,
};

const firstCenterTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 120,
};

const firstSideTransition: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 80,
  delay: 0.3,
};

function readIsFirstAccess(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(FIRST_LOAD_KEY) == null;
  } catch {
    return false;
  }
}

function buildPanelVariants(isFirstAccess: boolean, isDesktop: boolean): {
  center: Variants;
  left: Variants;
  right: Variants;
} {
  const centerTransition = isFirstAccess ? firstCenterTransition : navTransition;
  const sideTransition = isFirstAccess ? firstSideTransition : navTransition;

  if (!isDesktop) {
    return {
      center: {
        hidden: { opacity: 0, scale: 0.96, y: 15, rotateY: 0 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateY: 0,
          transition: centerTransition,
        },
      },
      left: {
        hidden: { opacity: 0, y: 12, rotateY: 0 },
        visible: {
          opacity: 1,
          y: 0,
          rotateY: 0,
          transition: sideTransition,
        },
      },
      right: {
        hidden: { opacity: 0, y: 12, rotateY: 0 },
        visible: {
          opacity: 1,
          y: 0,
          rotateY: 0,
          transition: sideTransition,
        },
      },
    };
  }

  return {
    center: {
      hidden: { opacity: 0, scale: 0.96, y: 15 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: centerTransition,
      },
    },
    left: {
      hidden: {
        opacity: 0,
        rotateY: -45,
        x: -70,
        z: -80,
        transformOrigin: "left center",
      },
      visible: {
        opacity: 1,
        rotateY: -12,
        x: 0,
        z: 0,
        transformOrigin: "left center",
        transition: sideTransition,
      },
    },
    right: {
      hidden: {
        opacity: 0,
        rotateY: 45,
        x: 70,
        z: -80,
        transformOrigin: "right center",
      },
      visible: {
        opacity: 1,
        rotateY: 12,
        x: 0,
        z: 0,
        transformOrigin: "right center",
        transition: sideTransition,
      },
    },
  };
}

type StageProps = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  className: string;
  leftClassName: string;
  centerClassName: string;
  rightClassName: string;
  isDesktop: boolean;
  isFirstAccess: boolean;
  motionInitial: "hidden" | false;
};

function CinematicStage({
  left,
  center,
  right,
  className,
  leftClassName,
  centerClassName,
  rightClassName,
  isDesktop,
  isFirstAccess,
  motionInitial,
}: StageProps) {
  const variants = useMemo(
    () => buildPanelVariants(isFirstAccess, isDesktop),
    [isFirstAccess, isDesktop],
  );

  return (
    <div className={className} style={stageStyle}>
      <motion.div
        variants={variants.left}
        initial={motionInitial}
        animate="visible"
        className={leftClassName}
        style={{
          ...gpuLayerStyle,
          ...(isDesktop ? { transformOrigin: "left center" } : null),
        }}
      >
        {left}
      </motion.div>

      <motion.div
        variants={variants.center}
        initial={motionInitial}
        animate="visible"
        className={centerClassName}
        style={gpuLayerStyle}
      >
        {center}
      </motion.div>

      <motion.div
        variants={variants.right}
        initial={motionInitial}
        animate="visible"
        className={rightClassName}
        style={{
          ...gpuLayerStyle,
          ...(isDesktop ? { transformOrigin: "right center" } : null),
        }}
      >
        {right}
      </motion.div>
    </div>
  );
}

type CinematicDashboardShellProps = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  className?: string;
  leftClassName?: string;
  centerClassName?: string;
  rightClassName?: string;
};

export function CinematicDashboardShell({
  left,
  center,
  right,
  className = "relative z-10 flex w-full items-center justify-center gap-[clamp(14px,1.4vw,24px)] px-6 py-10",
  leftClassName = "relative z-10 h-[clamp(550px,75vh,800px)] w-[clamp(215px,21.5vw,330px)] shrink-0",
  centerClassName = "relative z-30 shrink-0",
  rightClassName = "relative z-20 h-[clamp(550px,75vh,820px)] w-[clamp(240px,22vw,340px)] shrink-0",
}: CinematicDashboardShellProps) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const isDesktopMq = useMediaQuery(DESKTOP_MQ);
  const isDesktop = !hydrated || isDesktopMq;
  const motionInitial = hydrated ? "hidden" : false;

  const [trackedPathname, setTrackedPathname] = useState(pathname);
  const [isFirstAccess, setIsFirstAccess] = useState(readIsFirstAccess);

  // Troca de aba: no mesmo render do novo pathname, força modo navegação (0.3s).
  if (trackedPathname !== pathname) {
    setTrackedPathname(pathname);
    setIsFirstAccess(false);
  }

  useEffect(() => {
    try {
      // Primeiro acesso da sessão: marca a chave sem demotar o spring já em curso
      // (Strict Mode reexecuta o effect; set false aqui mataria a abertura triunfal).
      if (sessionStorage.getItem(FIRST_LOAD_KEY) == null) {
        sessionStorage.setItem(FIRST_LOAD_KEY, "1");
        setIsFirstAccess(true);
      }
    } catch {
      setIsFirstAccess(false);
    }
  }, []);

  return (
    <CinematicStage
      key={pathname}
      left={left}
      center={center}
      right={right}
      className={className}
      leftClassName={leftClassName}
      centerClassName={centerClassName}
      rightClassName={rightClassName}
      isDesktop={isDesktop}
      isFirstAccess={isFirstAccess}
      motionInitial={motionInitial}
    />
  );
}
