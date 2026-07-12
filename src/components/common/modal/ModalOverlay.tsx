"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/cn";

type ModalOverlayProps = {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
};

/**
 * Camada 1 do glass-on-glass: véu quente fosco sobre o background,
 * sem preto sólido — apenas blur + tint âmbar translúcido.
 */
export function ModalOverlay({ children, className, scrollable = false }: ModalOverlayProps) {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-100 grid place-items-center p-4",
        "bg-[rgba(38,20,8,0.46)] backdrop-blur-[22px] backdrop-brightness-[0.86] backdrop-saturate-150",
        scrollable && "overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
