/** Recessed control — carved into the glass (default / idle). */
export const formControlRecessedClassName =
  "border-white/[0.06] bg-black/[0.12] text-glass-primary";

/**
 * Focus elevates the control: brighter fill, orange rim, soft ring.
 * Drops the recessed dark edge so the field reads as “lifted”.
 */
export const formControlFocusClassName =
  "outline-none transition focus:border-orange-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-orange-500/20 focus-visible:border-orange-500/50 focus-visible:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-orange-500/20";

export const formControlInvalidClassName = "border-rose-500/40 ring-2 ring-rose-500/15";

export const inputSizeClasses = {
  sm: "py-1.5 text-[11px]",
  md: "py-2.5 text-sm",
} as const;

export const inputPaddingWithIcon = {
  sm: "pl-8 pr-3",
  md: "pl-10 pr-4",
} as const;

export const inputPaddingPlain = {
  sm: "px-2.5",
  md: "px-4",
} as const;

export const inputToneClasses = {
  default: formControlRecessedClassName,
  muted: "border-white/[0.06] bg-black/[0.16] text-glass-primary",
  login:
    "border-white/[0.06] bg-black/[0.12] text-glass-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
} as const;

export type FormControlSize = keyof typeof inputSizeClasses;
export type InputTone = keyof typeof inputToneClasses;
