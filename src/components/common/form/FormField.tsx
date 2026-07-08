import type { ReactNode } from "react";
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
        <label htmlFor={htmlFor} className="text-xs font-semibold tracking-wide text-white/55">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-xs text-orange-300/90">{error}</p> : null}
      {hint && !error ? <p className="text-[10px] text-white/40">{hint}</p> : null}
    </div>
  );
}
