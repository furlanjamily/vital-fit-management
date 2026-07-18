"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants, type ButtonProps } from "@/components/common/button/Button";
import { cn } from "@/lib/cn";

type GlassButtonSize = "sm" | "md" | "lg";
/** Intensidade legada — mapeada para o mesmo `variant="glass"`. */
type GlassButtonVariant = "subtle" | "default" | "strong";
type GlassButtonShape = "rounded" | "pill";

type GlassButtonChrome = {
  /** Intensidade legada do vidro (não confundir com `Button.variant`). */
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  shape?: GlassButtonShape;
  fullWidth?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** @deprecated Mantido por compat — o vidro agora é CSS no Button. */
  glassVariant?: string;
  intensity?: string;
  elevation?: string;
  panelClassName?: string;
  className?: string;
  children?: ReactNode;
};

type GlassButtonAsButton = Omit<
  ButtonProps,
  | "variant"
  | "size"
  | "leftIcon"
  | "rightIcon"
  | "children"
  | "isLoading"
  | "loading"
  | "fullWidth"
  | "className"
> &
  GlassButtonChrome & {
    href?: undefined;
  };

type GlassButtonAsLink = GlassButtonChrome &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof GlassButtonChrome> & {
    href: string;
  };

export type GlassButtonProps = GlassButtonAsButton | GlassButtonAsLink;

const legacyVariantClass: Record<GlassButtonVariant, string> = {
  subtle: "bg-white/[0.04] border-white/[0.06]",
  default: "",
  strong: "bg-white/[0.1] border-white/[0.12] font-semibold",
};

/**
 * Secundário vidro — atalho de `Button variant="glass"`.
 * Preferir `Button` diretamente em código novo.
 */
export function GlassButton({
  variant = "default",
  size = "md",
  shape = "rounded",
  fullWidth = false,
  iconOnly = false,
  loading = false,
  isLoading,
  leftIcon,
  rightIcon,
  panelClassName,
  className,
  children,
  ...props
}: GlassButtonProps) {
  const pending = Boolean(isLoading ?? loading);
  const isDisabled = ("disabled" in props && props.disabled) || pending;

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    return (
      <a
        href={href}
        aria-disabled={isDisabled || undefined}
        className={cn(
          buttonVariants({
            variant: "glass",
            size,
            fullWidth,
            iconOnly,
          }),
          shape === "pill" ? "rounded-full" : "rounded-xl",
          legacyVariantClass[variant],
          isDisabled && "pointer-events-none opacity-50",
          panelClassName,
          className,
        )}
        {...anchorProps}
      >
        {pending ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : iconOnly ? (
          (leftIcon ?? children)
        ) : (
          <>
            {leftIcon}
            {children != null ? <span className="truncate">{children}</span> : null}
            {rightIcon}
          </>
        )}
      </a>
    );
  }

  return (
    <Button
      {...(props as Omit<
        ButtonProps,
        | "variant"
        | "size"
        | "leftIcon"
        | "rightIcon"
        | "children"
        | "isLoading"
        | "fullWidth"
        | "iconOnly"
        | "className"
      >)}
      variant="glass"
      size={size}
      fullWidth={fullWidth}
      iconOnly={iconOnly}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      isLoading={pending}
      className={cn(
        shape === "pill" ? "rounded-full" : "rounded-xl",
        legacyVariantClass[variant],
        panelClassName,
        className,
      )}
    >
      {children}
    </Button>
  );
}
