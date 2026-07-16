import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/cn";

type GlassVariant = "default" | "hero" | "strong" | "subtle";
type GlassIntensity = "low" | "medium" | "high";
type GlassElevation = "base" | "floating" | "popover" | "modal" | "solid";

type GlassPanelProps = ComponentPropsWithoutRef<"div"> & {
  variant?: GlassVariant;
  intensity?: GlassIntensity;
  elevation?: GlassElevation;
};

/**
 * Variants only tune specular sheen strength.
 * Material body (opacity / blur / saturate / shadow) is owned by `elevation`.
 */
const variantClasses: Record<GlassVariant, string> = {
  subtle: "before:opacity-55",
  default: "before:opacity-70",
  hero: "before:opacity-85",
  strong: "before:opacity-78",
};

/**
 * Liquid Glass stacking (iOS / visionOS):
 * upper layers gain opacity + contrast; blur stays controlled — never stacked blindly.
 *
 * - base:     thin shell — prioritize seeing through to the warm background
 * - floating: light separator for nested cards / table chrome
 * - popover:  dense frost + warm amber underlay (menus, selects, ⋮)
 * - modal:    armored glass over ModalOverlay scrim
 * - solid:    opaque warm base when bleed-through must be blocked
 */
const elevationClasses: Record<GlassElevation, string> = {
  base: cn(
    "bg-white/[0.03] backdrop-blur-[20px] backdrop-saturate-[1.6]",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_30px_rgba(0,0,0,0.2)]",
  ),
  floating: cn(
    "border-white/8 bg-white/[0.08] backdrop-blur-[12px] backdrop-saturate-[1.4]",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_2px_12px_rgba(0,0,0,0.14)]",
  ),
  popover: cn(
    "bg-white/[0.14] backdrop-blur-[24px] backdrop-saturate-[1.8]",
    "after:bg-amber-500/[0.015]",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_12px_40px_-10px_rgba(0,0,0,0.5)]",
  ),
  modal: cn(
    "bg-white/[0.16] backdrop-blur-[32px] backdrop-saturate-[2]",
    "shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25),0_24px_60px_-15px_rgba(0,0,0,0.7)]",
  ),
  solid: cn(
    "backdrop-blur-none bg-[#8B6F4E]",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_1px_2px_rgba(0,0,0,0.1),0_6px_16px_rgba(0,0,0,0.18)]",
  ),
};

const intensityVars: Record<GlassIntensity, CSSProperties> = {
  low: {
    "--glass-shine": "rgba(255,255,255,0.18)",
  } as CSSProperties,
  medium: {
    "--glass-shine": "rgba(255,255,255,0.28)",
  } as CSSProperties,
  high: {
    "--glass-shine": "rgba(255,255,255,0.4)",
  } as CSSProperties,
};

export function GlassPanel({
  className,
  children,
  variant = "default",
  intensity = "medium",
  elevation = "base",
  style,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/8",
        "before:pointer-events-none before:absolute before:inset-px before:rounded-[inherit]",
        "before:bg-[linear-gradient(135deg,var(--glass-shine),transparent_24%,rgba(255,255,255,0.06)_62%,transparent),radial-gradient(circle_at_22%_0%,rgba(255,255,255,0.2),transparent_36%)]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
        variantClasses[variant],
        elevationClasses[elevation],
        className,
      )}
      style={{ ...intensityVars[intensity], ...style }}
      {...props}
    >
      {elevation === "solid" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(155deg,rgba(255,255,255,0.22)_0%,rgba(255,248,235,0.1)_42%,rgba(255,255,255,0.04)_100%)]"
        />
      ) : null}
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}
