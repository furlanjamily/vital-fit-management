"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/cn";

type ModalOverlayProps = {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
};

export function ModalOverlay({ children, className, scrollable = false }: ModalOverlayProps) {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-100 grid place-items-center bg-black/30 p-4 backdrop-blur-md backdrop-saturate-150",
        scrollable && "overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
