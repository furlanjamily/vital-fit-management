export const formControlFocusClassName =
  "outline-none transition focus:border-white/28 focus-visible:ring-2 focus-visible:ring-orange-400/25";

export const formControlInvalidClassName = "border-rose-500/30";

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
  default: "border-white/14 bg-white/5",
  muted: "border-white/14 bg-white/8",
  login: "border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-white/30",
} as const;

export type FormControlSize = keyof typeof inputSizeClasses;
export type InputTone = keyof typeof inputToneClasses;
