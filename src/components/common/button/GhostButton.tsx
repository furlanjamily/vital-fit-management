import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type GhostButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  active?: boolean;
};

export function GhostButton({
  active = false,
  className,
  children,
  type = "button",
  ...props
}: GhostButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-xs font-medium transition",
        active
          ? "bg-white/10 text-white"
          : "text-white/50 hover:bg-white/8 hover:text-white/90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
