import type { ReactNode } from "react";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {label ? (
        <label htmlFor={htmlFor} className={cn("text-xs font-semibold tracking-wide", glassText.secondary)}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-rose-400/90">{error}</p> : null}
      {hint && !error ? <p className={cn("text-[10px]", glassText.muted)}>{hint}</p> : null}
    </div>
  );
}
