import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/cn";

type GlassVariant = "default" | "hero" | "strong" | "subtle";
type GlassIntensity = "low" | "medium" | "high";

type GlassPanelProps = ComponentPropsWithoutRef<"div"> & {
  variant?: GlassVariant;
  intensity?: GlassIntensity;
};

const variantClasses: Record<GlassVariant, string> = {
  subtle:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.095),rgba(255,255,255,0.028)_58%,rgba(255,255,255,0.016))] shadow-[0_18px_58px_rgba(32,22,14,0.2)] backdrop-blur-[20px]",
  default:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.115),rgba(255,255,255,0.04)_52%,rgba(255,255,255,0.018))] shadow-[0_30px_96px_rgba(32,22,14,0.28)] backdrop-blur-[28px]",
  hero:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.155),rgba(255,255,255,0.058)_44%,rgba(255,255,255,0.024)_100%)] shadow-[0_48px_150px_rgba(32,22,14,0.38),0_16px_58px_rgba(255,255,255,0.05)] backdrop-blur-[36px]",
  strong:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.125),rgba(255,255,255,0.045)_54%,rgba(255,255,255,0.018))] shadow-[0_38px_124px_rgba(32,22,14,0.34)] backdrop-blur-[30px]",
};

const intensityVars: Record<GlassIntensity, CSSProperties> = {
  low: {
    "--glass-shine": "rgba(255,255,255,0.2)",
    "--glass-border": "rgba(255,255,255,0.16)",
  } as CSSProperties,
  medium: {
    "--glass-shine": "rgba(255,255,255,0.3)",
    "--glass-border": "rgba(255,255,255,0.24)",
  } as CSSProperties,
  high: {
    "--glass-shine": "rgba(255,255,255,0.46)",
    "--glass-border": "rgba(255,255,255,0.34)",
  } as CSSProperties,
};

export function GlassPanel({
  className,
  children,
  variant = "default",
  intensity = "medium",
  style,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-(--glass-border)",
        "before:pointer-events-none before:absolute before:inset-px before:rounded-[inherit]",
        "before:bg-[linear-gradient(135deg,var(--glass-shine),transparent_24%,rgba(255,255,255,0.08)_62%,transparent),radial-gradient(circle_at_22%_0%,rgba(255,255,255,0.24),transparent_36%)] before:opacity-75",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
        "after:shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(255,255,255,0.09),inset_10px_0_28px_rgba(255,255,255,0.04)]",
        variantClasses[variant],
        className,
      )}
      style={{ ...intensityVars[intensity], ...style }}
      {...props}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
