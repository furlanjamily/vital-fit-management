import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
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
import { cn } from "@/lib/cn";

export type GlassSelectOption = {
  value: string;
  label: string;
};

export type GlassSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options: GlassSelectOption[];
  leftIcon?: LucideIcon;
  selectSize?: FormControlSize;
  tone?: InputTone;
  invalid?: boolean;
  wrapperClassName?: string;
  placeholder?: string;
};

export function GlassSelect({
  options,
  leftIcon: LeftIcon,
  selectSize = "md",
  tone = "default",
  invalid = false,
  wrapperClassName,
  className,
  disabled,
  placeholder,
  ...props
}: GlassSelectProps) {
  const hasLeftIcon = Boolean(LeftIcon);
  const chevronClassName = selectSize === "sm" ? "right-2 size-3" : "right-3.5 size-3.5";

  return (
    <div className={cn("relative", wrapperClassName)}>
      {LeftIcon ? (
        <LeftIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      ) : null}

      <select
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-xl border text-white",
          inputToneClasses[tone],
          inputSizeClasses[selectSize],
          hasLeftIcon ? inputPaddingWithIcon[selectSize] : inputPaddingPlain[selectSize],
          "pr-9 [&>option]:bg-[#221d17]",
          formControlFocusClassName,
          invalid && formControlInvalidClassName,
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/40",
          chevronClassName,
        )}
      />
    </div>
  );
}

export type GlassSelectNativeProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  leftIcon?: LucideIcon;
  selectSize?: FormControlSize;
  tone?: InputTone;
  invalid?: boolean;
  wrapperClassName?: string;
  children: ReactNode;
};

/** Select com children customizados (quando options prop não basta). */
export function GlassSelectNative({
  leftIcon: LeftIcon,
  selectSize = "md",
  tone = "default",
  invalid = false,
  wrapperClassName,
  className,
  disabled,
  children,
  ...props
}: GlassSelectNativeProps) {
  const hasLeftIcon = Boolean(LeftIcon);
  const chevronClassName = selectSize === "sm" ? "right-2 size-3" : "right-3.5 size-3.5";

  return (
    <div className={cn("relative", wrapperClassName)}>
      {LeftIcon ? (
        <LeftIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
      ) : null}

      <select
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-xl border text-white",
          inputToneClasses[tone],
          inputSizeClasses[selectSize],
          hasLeftIcon ? inputPaddingWithIcon[selectSize] : inputPaddingPlain[selectSize],
          "pr-9 [&>option]:bg-[#221d17]",
          formControlFocusClassName,
          invalid && formControlInvalidClassName,
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/40",
          chevronClassName,
        )}
      />
    </div>
  );
}
