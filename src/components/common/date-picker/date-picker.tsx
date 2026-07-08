"use client";

import { useRef, type InputHTMLAttributes } from "react";
import { Calendar } from "lucide-react";
import {
  formControlFocusClassName,
  inputPaddingPlain,
  inputSizeClasses,
  inputToneClasses,
  type FormControlSize,
  type InputTone,
} from "@/components/common/form/form.styles";
import { cn } from "@/lib/cn";

export type DatePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
  pickerSize?: FormControlSize;
  tone?: InputTone;
  wrapperClassName?: string;
  placeholder?: string;
};

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;

  return `${day.padStart(2, "0")} / ${month.padStart(2, "0")} / ${year}`;
}

export function DatePicker({
  value = "",
  onChange,
  pickerSize = "md",
  tone = "muted",
  wrapperClassName,
  placeholder = "dd / mm / aaaa",
  disabled,
  className,
  ...props
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    if (disabled) return;

    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  return (
    <div className={cn("relative", wrapperClassName)}>
      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className={cn(
          "flex w-full items-center rounded-full border text-left",
          inputToneClasses[tone],
          inputSizeClasses[pickerSize],
          inputPaddingPlain[pickerSize],
          "pr-10",
          formControlFocusClassName,
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <span className={cn("truncate", value ? "text-white" : "text-white/32")}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      <Calendar
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-white/40",
          pickerSize === "sm" ? "right-2.5 size-3.5" : "right-3.5 size-4",
        )}
      />

      <input
        ref={inputRef}
        type="date"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        tabIndex={-1}
        aria-label={props["aria-label"] ?? "Selecionar data"}
        {...props}
      />
    </div>
  );
}
