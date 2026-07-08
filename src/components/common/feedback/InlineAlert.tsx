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
        "rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200/90",
        className,
      )}
    >
      {children}
    </p>
  );
}
