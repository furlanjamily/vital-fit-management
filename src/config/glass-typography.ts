import { cn } from "@/lib/cn";

/**
 * Glass-on-glass text hierarchy.
 * Pair with GlassPanel elevations — denser frost (popover/modal) uses *Elevated variants.
 */
export const glassText = {
  /** High-importance: titles, primary values (#ffffff). */
  primary: "text-glass-primary",
  /** Support labels, descriptions (≈ white/63). */
  secondary: "text-glass-secondary",
  /** Help text, placeholders, disabled (≈ white/47). */
  tertiary: "text-glass-tertiary",
  /** Alias for tertiary — empty states, hints. */
  muted: "text-glass-muted",
  /** Input/select placeholders. */
  placeholder: "placeholder:text-glass-placeholder",
  /** Popover/modal primary — compensates for dense blur. */
  primaryElevated: "text-glass-primary font-medium",
  /** Popover/modal secondary. */
  secondaryElevated: "text-glass-secondary font-medium",
  /** Sparingly: separates primary text from bright glass layers. */
  contrastShadow: "text-glass-contrast-shadow",
} as const;

/** Composed patterns for recurring UI surfaces. */
export const glassTextStyles = {
  modalTitle: cn(glassText.primaryElevated, "text-sm font-semibold"),
  modalSubtitle: cn(glassText.secondary, "mt-1 text-[11px]"),
  panelTitle: cn(glassText.primary, "text-sm font-semibold"),
  tableHeader: cn(
    glassText.tertiary,
    "text-[9px] font-semibold uppercase tracking-[0.08em]",
  ),
  tableCell: cn(glassText.secondary, "text-xs"),
  tableEmpty: cn(glassText.muted, "text-xs"),
  kpiValue: cn(glassText.primary, "text-xl font-semibold tracking-[-0.03em]"),
  kpiLabel: cn(glassText.muted, "text-[11px]"),
  pageTitle: cn(glassText.primary, "text-[1.72rem] font-semibold tracking-[-0.055em]"),
  pageSubtitle: cn(glassText.muted, "mt-1 text-sm"),
  entityName: cn(glassText.primary, "text-xs font-semibold"),
  entityEmail: cn(glassText.tertiary, "text-[10px]"),
  badge: cn(glassText.secondary, "text-[10px] font-medium"),
} as const;
