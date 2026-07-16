"use client";

import { Button, type ButtonProps } from "@/components/common/button/Button";
import { cn } from "@/lib/cn";

type GhostButtonProps = Omit<ButtonProps, "variant" | "size"> & {
  /** Estado selecionado (filtros / tabs). */
  active?: boolean;
  /**
   * Sem efeito glass: fundo sempre transparente (sem blur / tint no hover).
   * Útil dentro de GlassPanel / menus onde o vidro já vem do pai.
   */
  transparent?: boolean;
};

/** Terciário — atalho de `Button variant="ghost"` (ou `transparent`). */
export function GhostButton({
  active = false,
  transparent = false,
  className,
  children,
  type = "button",
  ...props
}: GhostButtonProps) {
  return (
    <Button
      type={type}
      variant={transparent ? "transparent" : "ghost"}
      size="sm"
      className={cn(
        "rounded-lg font-medium",
        active && !transparent && "bg-white/10 text-white",
        active && transparent && "text-white",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
