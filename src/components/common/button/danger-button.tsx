import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type DangerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leftIcon?: ReactNode;
};

export function DangerButton({
  leftIcon,
  className,
  children,
  type = "button",
  ...props
}: DangerButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl bg-red-400/90 px-4 py-2.5 text-xs font-semibold text-[#1a0d0a] transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
