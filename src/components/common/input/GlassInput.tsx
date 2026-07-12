import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  formControlFocusClassName,
  formControlInvalidClassName,
  inputPaddingPlain,
  inputPaddingWithIcon,
  inputSizeClasses,
  inputToneClasses,
  type FormControlSize,
  type InputTone,
} from "@/components/common/form/form.styles";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type GlassInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  leftIcon?: LucideIcon;
  rightSlot?: ReactNode;
  inputSize?: FormControlSize;
  tone?: InputTone;
  invalid?: boolean;
  wrapperClassName?: string;
};

export function GlassInput({
  leftIcon: LeftIcon,
  rightSlot,
  inputSize = "md",
  tone = "default",
  invalid = false,
  wrapperClassName,
  className,
  disabled,
  ...props
}: GlassInputProps) {
  const hasLeftIcon = Boolean(LeftIcon);
  const hasRightSlot = Boolean(rightSlot);

  return (
    <div className={cn("relative", wrapperClassName)}>
      {LeftIcon ? (
        <LeftIcon className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", glassText.tertiary)} />
      ) : null}

      <input
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border text-glass-primary",
          glassText.placeholder,
          inputToneClasses[tone],
          inputSizeClasses[inputSize],
          hasLeftIcon ? inputPaddingWithIcon[inputSize] : inputPaddingPlain[inputSize],
          hasRightSlot && "pr-11",
          formControlFocusClassName,
          invalid && formControlInvalidClassName,
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      />

      {rightSlot ? (
        <div className="absolute inset-y-0 right-0 flex items-center">{rightSlot}</div>
      ) : null}
    </div>
  );
}
