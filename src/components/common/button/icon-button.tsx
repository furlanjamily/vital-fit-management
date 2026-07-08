import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type IconButtonShape = "round" | "square";
type IconButtonSize = "sm" | "md";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  shape?: IconButtonShape;
  size?: IconButtonSize;
  children: ReactNode;
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-9",
};

const shapeClasses: Record<IconButtonShape, string> = {
  round: "rounded-full",
  square: "rounded-lg",
};

export function IconButton({
  shape = "round",
  size = "sm",
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "grid place-items-center border border-white/14 bg-white/5 text-white/60 transition hover:border-white/22 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40",
        sizeClasses[size],
        shapeClasses[shape],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
