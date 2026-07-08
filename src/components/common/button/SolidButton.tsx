import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type SolidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
};

export function SolidButton({
  loading = false,
  leftIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: SolidButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1a1d19] transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  );
}
