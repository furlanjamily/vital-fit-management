"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { GhostButton, IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type RowAction = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
};

type RowActionsMenuProps = {
  ariaLabel: string;
  actions: RowAction[];
  disabled?: boolean;
};

const ACTION_TONE_CLASSES: Record<NonNullable<RowAction["tone"]>, string> = {
  default: cn(
    glassText.primaryElevated,
    "hover:bg-white/10 hover:text-glass-primary",
  ),
  danger: "text-red-300 hover:bg-red-500/12 hover:text-red-200",
};

export function RowActionsMenu({
  ariaLabel,
  actions,
  disabled = false,
}: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function handleSelect(action: RowAction) {
    if (action.disabled) return;
    setOpen(false);
    action.onSelect();
  }

  return (
    <div ref={containerRef} className="relative z-30 flex justify-end">
      <IconButton
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "bg-white/7 text-glass-secondary hover:bg-white/13 hover:text-glass-primary",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical className="size-3.5" />
      </IconButton>

      {open && (
        <GlassPanel
          variant="strong"
          intensity="high"
          elevation="popover"
          className="absolute right-0 top-10 z-50 w-44 rounded-xl p-1.5"
        >
          {actions.map((action) => (
            <GhostButton
              key={action.label}
              disabled={disabled || action.disabled}
              className={cn(
                "w-full justify-start gap-2.5 px-3 py-2 text-left",
                ACTION_TONE_CLASSES[action.tone ?? "default"],
                action.disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
              )}
              onClick={() => handleSelect(action)}
            >
              <action.icon className="size-3.5" />
              {action.label}
            </GhostButton>
          ))}
        </GlassPanel>
      )}
    </div>
  );
}
