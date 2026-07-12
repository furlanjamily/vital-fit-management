import type { ButtonHTMLAttributes, ReactNode } from "react";
import { glassText } from "@/config/glass-typography";
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
          ? cn("bg-white/10", glassText.primary)
          : cn(glassText.tertiary, "hover:bg-white/8 hover:text-glass-primary"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
