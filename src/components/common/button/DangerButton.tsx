"use client";

import { Button, type ButtonProps } from "@/components/common/button/Button";

type DangerButtonProps = Omit<ButtonProps, "variant">;

/** Ação destrutiva — atalho de `Button variant="danger"`. */
export function DangerButton({
  leftIcon,
  className,
  children,
  type = "button",
  isLoading,
  loading,
  size = "sm",
  ...props
}: DangerButtonProps) {
  return (
    <Button
      type={type}
      variant="danger"
      size={size}
      leftIcon={leftIcon}
      isLoading={isLoading ?? loading}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
