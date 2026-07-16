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

const variantClasses: Record<GlassVariant, string> = {
  subtle:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.095),rgba(255,255,255,0.028)_58%,rgba(255,255,255,0.016))] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-[20px]",
  default:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.115),rgba(255,255,255,0.04)_52%,rgba(255,255,255,0.018))] shadow-[0_2px_4px_rgba(0,0,0,0.08),0_12px_36px_rgba(0,0,0,0.16)] backdrop-blur-[28px]",
  hero:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.155),rgba(255,255,255,0.058)_44%,rgba(255,255,255,0.024)_100%)] shadow-[0_4px_8px_rgba(0,0,0,0.1),0_20px_56px_rgba(0,0,0,0.2)] backdrop-blur-[36px]",
  strong:
    "bg-[linear-gradient(145deg,rgba(255,255,255,0.125),rgba(255,255,255,0.045)_54%,rgba(255,255,255,0.018))] shadow-[0_2px_6px_rgba(0,0,0,0.08),0_16px_44px_rgba(0,0,0,0.18)] backdrop-blur-[30px]",
};

/**
 * Liquid Glass stacking physics (visionOS):
 * layers in front use LESS blur and MORE opacity so overlapping panels
 * never compound the backdrop blur of layers underneath.
 *
 * - base:     background panels — keeps the variant's high blur, adds saturation.
 * - floating: overlays (cards, sections) — lighter glass body.
 * - popover:  menus/dropdowns — denser frost + warm underlay for text legibility.
 * - modal:    top-most layer — low blur, denser white frost + warm underlay
 *             for legibility over the scrim (glass on glass), no solid black.
 * - solid:    menus/tooltips over dense UI — opaque warm base (no bleed-through)
 *             with glass shine/border on top.
 *
 * These are merged AFTER variantClasses via cn()/tailwind-merge, so the
 * elevation's backdrop-blur and shadow win over the variant's without
 * generating conflicting utilities.
 */
const elevationClasses: Record<GlassElevation, string> = {
  base: "backdrop-saturate-150 backdrop-brightness-[0.88]",
  floating:
    "backdrop-blur-[12px] backdrop-saturate-150 backdrop-brightness-[0.9] bg-white/5 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.16)]",
  popover:
    "backdrop-blur-[14px] backdrop-saturate-[1.8] backdrop-brightness-[0.78] bg-[linear-gradient(155deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.26)_42%,rgba(255,236,210,0.2)_100%)] shadow-[0_2px_6px_rgba(0,0,0,0.1),0_12px_40px_rgba(0,0,0,0.2)]",
  modal:
    "backdrop-blur-[12px] backdrop-saturate-[1.85] backdrop-brightness-[0.76] bg-[linear-gradient(155deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.28)_40%,rgba(255,236,210,0.22)_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.12),0_18px_52px_rgba(0,0,0,0.22)]",
  solid:
    "backdrop-blur-none bg-[#8B6F4E] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_6px_16px_rgba(0,0,0,0.18)]",
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
  elevation = "base",
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
        elevationClasses[elevation],
        className,
      )}
      style={{ ...intensityVars[intensity], ...style }}
      {...props}
    >
      {elevation === "modal" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(165deg,rgba(255,255,255,0.16)_0%,rgba(255,248,235,0.1)_40%,rgba(42,20,8,0.52)_100%)]"
        />
      ) : null}
      {elevation === "popover" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(165deg,rgba(255,255,255,0.14)_0%,rgba(255,248,235,0.09)_40%,rgba(42,20,8,0.48)_100%)]"
        />
      ) : null}
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
