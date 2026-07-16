"use client";

import { forwardRef, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-full font-medium tracking-[-0.01em]",
    "transition-[background-color,box-shadow,color,filter,opacity,border-color] duration-200",
    "select-none cursor-pointer",
    "disabled:opacity-50 disabled:pointer-events-none disabled:grayscale-[30%]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A4A]/50",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-black/20",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-[#FF8A35] to-[#FF9A4A]",
          "text-white font-medium",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_4px_15px_rgba(255,110,0,0.3)]",
          "hover:brightness-110 hover:saturate-125",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_6px_20px_rgba(255,110,0,0.4)]",
        ].join(" "),
        glass: [
          "bg-white/[0.06] backdrop-blur-[12px] backdrop-saturate-[1.4]",
          "border border-white/[0.08] text-white/90",
          "hover:bg-white/[0.12] hover:border-white/[0.16]",
          "hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]",
        ].join(" "),
        ghost: [
          "bg-transparent border-transparent text-white/70",
          "hover:text-white hover:bg-white/[0.06] backdrop-blur-sm",
        ].join(" "),
        /** Sem vidro — só texto sobre fundo transparente. */
        transparent: [
          "bg-transparent border-transparent text-white/70 backdrop-blur-none",
          "hover:text-white hover:bg-transparent",
        ].join(" "),
        danger: [
          "bg-red-500/10 border border-red-500/20 text-red-400",
          "hover:bg-red-500/20 hover:border-red-500/30",
        ].join(" "),
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3 text-base font-semibold",
      },
      iconOnly: {
        true: "",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "sm", class: "size-8 gap-0 px-0 py-0" },
      { iconOnly: true, size: "md", class: "size-9 gap-0 px-0 py-0" },
      { iconOnly: true, size: "lg", class: "size-11 gap-0 px-0 py-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
      fullWidth: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Props do Button VitalFit.
 * Estende atributos nativos de `<button>` via HTMLMotionProps (framer-motion).
 */
export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "color">,
    ButtonVariantProps {
  children?: ReactNode;
  /** Substitui ícone/texto por spinner animado. */
  isLoading?: boolean;
  /** Alias legado de `isLoading` — preferir `isLoading`. */
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Botão quadrado só com ícone (pílula). */
  iconOnly?: boolean;
  fullWidth?: boolean;
}

const iconSizeByButtonSize: Record<NonNullable<ButtonVariantProps["size"]>, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size = "md",
      iconOnly = false,
      fullWidth = false,
      isLoading,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      whileHover,
      whileTap,
      transition,
      ...props
    },
    ref,
  ) {
    const pending = Boolean(isLoading ?? loading);
    const isDisabled = Boolean(disabled || pending);
    const resolvedSize = size ?? "md";
    const spinnerClass = iconSizeByButtonSize[resolvedSize];

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={pending || undefined}
        aria-disabled={isDisabled || undefined}
        whileHover={isDisabled ? undefined : (whileHover ?? { scale: 1.02 })}
        whileTap={isDisabled ? undefined : (whileTap ?? { scale: 0.98 })}
        transition={
          transition ?? { type: "spring", stiffness: 480, damping: 28, mass: 0.4 }
        }
        className={cn(
          buttonVariants({
            variant,
            size: resolvedSize,
            iconOnly,
            fullWidth,
          }),
          className,
        )}
        {...props}
      >
        {pending ? (
          <Loader2 className={cn(spinnerClass, "shrink-0 animate-spin")} aria-hidden="true" />
        ) : iconOnly ? (
          (leftIcon ?? children)
        ) : (
          <>
            {leftIcon}
            {children != null ? <span className="truncate">{children}</span> : null}
            {rightIcon}
          </>
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
