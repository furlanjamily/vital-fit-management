import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type GlassSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function GlassSwitch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: GlassSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-emerald-400/40 bg-emerald-400/30" : "border-white/20 bg-white/10",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked ? "left-[calc(100%-1.375rem)]" : "left-0.5",
        )}
      />
    </button>
  );
}
