import type { ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { cn } from "@/lib/cn";

const SKELETON_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

type SkeletonGlassPanelProps = {
  className?: string;
  children: ReactNode;
  /** Rótulo acessível enquanto o painel carrega */
  label?: string;
};

export function SkeletonGlassPanel({
  className,
  children,
  label = "Carregando conteúdo",
}: SkeletonGlassPanelProps) {
  return (
    <GlassPanel
      {...SKELETON_GLASS}
      className={cn(className)}
      aria-busy="true"
      aria-label={label}
    >
      {children}
    </GlassPanel>
  );
}
