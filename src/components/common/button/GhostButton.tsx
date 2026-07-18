"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  Button,
  buttonVariants,
  type ButtonProps,
  type ButtonSize,
} from "@/components/common/button/Button";
import { cn } from "@/lib/cn";

type GhostButtonChrome = {
  /** Estado selecionado (filtros / tabs). */
  active?: boolean;
  /**
   * Sem efeito glass: fundo sempre transparente (sem blur / tint no hover).
   * Útil dentro de GlassPanel / menus onde o vidro já vem do pai.
   */
  transparent?: boolean;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type GhostButtonAsButton = Omit<
  ButtonProps,
  "variant" | "size" | "leftIcon" | "rightIcon" | "children" | "isLoading" | "loading" | "fullWidth" | "className" | "iconOnly"
> &
  GhostButtonChrome & {
    href?: undefined;
  };

type GhostButtonAsLink = GhostButtonChrome &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof GhostButtonChrome> & {
    href: string;
  };

export type GhostButtonProps = GhostButtonAsButton | GhostButtonAsLink;

/** Terciário — atalho de `Button variant="ghost"` (ou `transparent`). */
export function GhostButton({
  active = false,
  transparent = false,
  size = "sm",
  fullWidth = false,
  iconOnly = false,
  isLoading,
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: GhostButtonProps) {
  const pending = Boolean(isLoading ?? loading);
  const variant = transparent ? "transparent" : "ghost";
  const toneClass = cn(
    active && !transparent && "bg-white/10 text-white",
    active && transparent && "text-white",
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    const isDisabled =
      ("aria-disabled" in anchorProps && anchorProps["aria-disabled"]) || pending;

    return (
      <a
        href={href}
        aria-disabled={isDisabled || undefined}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            iconOnly,
          }),
          isDisabled && "pointer-events-none opacity-50",
          toneClass,
        )}
        {...anchorProps}
      >
        {pending ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
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

  const { type = "button", ...buttonProps } = props as GhostButtonAsButton;

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      iconOnly={iconOnly}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      isLoading={pending}
      className={toneClass}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
