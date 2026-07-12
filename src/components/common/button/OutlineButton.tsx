import type { ButtonHTMLAttributes, ReactNode } from "react";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type OutlineButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function OutlineButton({ className, children, type = "button", ...props }: OutlineButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        cn(
          "inline-flex items-center justify-center rounded-xl border border-white/14 bg-white/7 px-4 py-2.5 text-xs font-semibold transition hover:bg-white/13 disabled:cursor-not-allowed disabled:opacity-50",
          glassText.secondary,
          "hover:text-glass-primary",
        ),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
