import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

/**
 * Bloco base de carregamento — herda border-radius via className
 * para espelhar o componente final (GlassPanel, cards, barras, etc.).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-md",
        "bg-gradient-to-r from-white/5 via-white/10 to-white/5",
        className,
      )}
      {...props}
    />
  );
}
