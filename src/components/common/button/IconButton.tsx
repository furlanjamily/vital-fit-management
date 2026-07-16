"use client";

import { forwardRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/common/button/Button";
import { cn } from "@/lib/cn";

type IconButtonShape = "round" | "square";
type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = Omit<
  ButtonProps,
  "iconOnly" | "leftIcon" | "rightIcon" | "children"
> & {
  shape?: IconButtonShape;
  size?: IconButtonSize;
  children: ReactNode;
};

/**
 * Botão só ícone — atalho de `Button` com `iconOnly`.
 * Sempre passe `aria-label` para acessibilidade.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      shape = "round",
      size = "sm",
      variant = "glass",
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <Button
        ref={ref}
        iconOnly
        size={size}
        variant={variant}
        className={cn(shape === "square" && "!rounded-lg", className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

IconButton.displayName = "IconButton";
