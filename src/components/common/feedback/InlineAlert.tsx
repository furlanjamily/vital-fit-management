import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type InlineAlertProps = {
  children: ReactNode;
  className?: string;
};

export function InlineAlert({ children, className }: InlineAlertProps) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200/90",
        className,
      )}
    >
      {children}
    </p>
  );
}
