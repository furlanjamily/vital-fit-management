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
 * Camada 1 do glass-on-glass: scrim marrom-escuro translúcido + blur,
 * fundindo com o fundo âmbar sem preto sólido.
 */
export function ModalOverlay({ children, className, scrollable = false }: ModalOverlayProps) {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-100 grid place-items-center p-4",
        "bg-[rgba(15,10,5,0.45)] backdrop-blur-[16px] backdrop-saturate-[1.6]",
        scrollable && "overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
