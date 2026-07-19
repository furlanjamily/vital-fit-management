"use client";

import { Toaster } from "sonner";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const glassToast = cn(
  "group flex w-[356px] items-center gap-3 rounded-2xl border border-white/12 px-4 py-3.5",
  // Liquid Glass — elevation popover
  "bg-white/[0.14] backdrop-blur-[24px] backdrop-saturate-[1.8]",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_12px_40px_-10px_rgba(0,0,0,0.5)]",
  "text-glass-primary",
);

/**
 * Toaster global — z-index acima de modais Liquid Glass (z-100/z-101).
 * `unstyled` remove o tema padrão do Sonner para o glass assumir o visual.
 */
export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      closeButton
      duration={4000}
      gap={10}
      visibleToasts={4}
      className="z-200!"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: glassToast,
          title: cn("text-sm font-medium leading-snug", glassText.primary),
          description: cn("text-xs leading-snug", glassText.secondary),
          icon: "mt-0.5 size-4 shrink-0",
          success: cn(
            "border-emerald-400/30!",
            "[&_[data-icon]]:text-emerald-300",
          ),
          error: cn(
            "border-orange-500/35!",
            "[&_[data-icon]]:text-orange-300",
          ),
          warning: cn(
            "border-amber-400/30!",
            "[&_[data-icon]]:text-amber-300",
          ),
          info: cn(
            "border-white/20!",
            "[&_[data-icon]]:text-glass-secondary",
          ),
          closeButton: cn(
            "absolute! top-2! right-2! left-auto! flex! size-6! items-center! justify-center!",
            "rounded-full! border border-white/15 bg-white/10 p-0!",
            "text-glass-secondary transition hover:bg-white/18 hover:text-glass-primary",
            "[&>svg]:relative! [&>svg]:size-3! [&>svg]:translate-x-0! [&>svg]:translate-y-0!",
          ),
          actionButton: cn(
            "rounded-lg bg-gradient-to-r from-orange-500 to-orange-600",
            "px-3 py-1.5 text-xs font-semibold text-white",
          ),
          cancelButton: cn(
            "rounded-lg border border-white/12 bg-white/8",
            "px-3 py-1.5 text-xs font-medium",
            glassText.secondary,
          ),
        },
      }}
    />
  );
}
