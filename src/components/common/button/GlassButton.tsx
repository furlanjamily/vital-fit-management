import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { GlassPanel } from "../glass-panel/GlassPanel";

type GlassPanelVariant = "default" | "hero" | "strong" | "subtle";
type GlassPanelIntensity = "low" | "medium" | "high";
type GlassPanelElevation = "base" | "floating" | "modal";

/** Intensidade visual do vidro — sem cores sólidas, só GlassPanel. */
type GlassButtonVariant = "subtle" | "default" | "strong";
type GlassButtonSize = "sm" | "md" | "lg";
type GlassButtonShape = "rounded" | "pill";

type GlassButtonBaseProps = {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  shape?: GlassButtonShape;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Sobrescreve props do GlassPanel quando necessário. */
  glassVariant?: GlassPanelVariant;
  intensity?: GlassPanelIntensity;
  elevation?: GlassPanelElevation;
  panelClassName?: string;
  className?: string;
  children?: ReactNode;
};

type GlassButtonAsButton = GlassButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type GlassButtonAsLink = GlassButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type GlassButtonProps = GlassButtonAsButton | GlassButtonAsLink;

const variantPreset: Record<
  GlassButtonVariant,
  {
    glassVariant: GlassPanelVariant;
    intensity: GlassPanelIntensity;
    elevation: GlassPanelElevation;
  }
> = {
  subtle: {
    glassVariant: "subtle",
    intensity: "low",
    elevation: "floating",
  },
  default: {
    glassVariant: "default",
    intensity: "medium",
    elevation: "floating",
  },
  strong: {
    glassVariant: "strong",
    intensity: "high",
    elevation: "floating",
  },
};

const sizeClasses: Record<GlassButtonSize, string> = {
  sm: "gap-1.5 px-3 py-2 text-xs",
  md: "gap-2 px-4 py-3 text-sm",
  lg: "gap-2.5 px-5 py-3.5 text-sm",
};

const shapeClasses: Record<GlassButtonShape, string> = {
  rounded: "rounded-xl",
  pill: "rounded-full",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ad5ff]/60";

export function GlassButton({
  variant = "default",
  size = "md",
  shape = "rounded",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  glassVariant,
  intensity,
  elevation,
  panelClassName,
  className,
  children,
  ...props
}: GlassButtonProps) {
  const preset = variantPreset[variant];
  const isDisabled = ("disabled" in props && props.disabled) || loading;
  const radius = shapeClasses[shape];

  const content = (
    <>
      {loading && (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      )}

      {!loading && leftIcon && (
        <GlassPanel variant="subtle" intensity="low" elevation="floating" className="rounded-full p-2">
          {leftIcon}
        </GlassPanel>
      )}

      <span className="truncate">{children}</span>

      {!loading && rightIcon && <GlassPanel intensity="low" elevation="floating" className="rounded-full p-2">
        {rightIcon}
      </GlassPanel>
      }
    </>
  );

  const innerClassName = cn(
    "inline-flex w-full items-center justify-center font-semibold tracking-[-0.01em] transition",
    glassText.primary,
    "hover:bg-white/8 active:bg-white/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
    sizeClasses[size],
    radius,
    focusRing,
    isDisabled && "cursor-not-allowed opacity-60",
    className,
  );

  return (
    <GlassPanel
      variant={glassVariant ?? preset.glassVariant}
      intensity={intensity ?? preset.intensity}
      elevation={elevation ?? preset.elevation}
      className={cn(radius, fullWidth && "w-full", panelClassName)}
    >
      {"href" in props && props.href ? (
        <a
          {...props}
          aria-disabled={isDisabled || undefined}
          className={cn(innerClassName, isDisabled && "pointer-events-none")}
        >
          {content}
        </a>
      ) : (
        <button
          {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
          type={(props as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
          disabled={isDisabled}
          className={innerClassName}
        >
          {content}
        </button>
      )}
    </GlassPanel>
  );
}
