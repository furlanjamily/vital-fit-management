import type { ComponentPropsWithoutRef } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type ModalPanelProps = ComponentPropsWithoutRef<typeof GlassPanel>;

/**
 * Camada 2 do glass-on-glass: painel sobre o scrim do ModalOverlay,
 * com frost mais denso para legibilidade do texto.
 */
export function ModalPanel({
  className,
  variant = "strong",
  intensity = "high",
  elevation = "modal",
  ...props
}: ModalPanelProps) {
  return (
    <GlassPanel
      variant={variant}
      intensity={intensity}
      elevation={elevation}
      className={cn("rounded-2xl p-6", glassText.secondary, className)}
      {...props}
    />
  );
}
