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
    "hover:bg-[#A0825C] hover:text-glass-primary",
  ),
  danger: "text-red-300 hover:bg-[#9A4A3A] hover:text-red-100",
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
    <div
      ref={containerRef}
      className={cn("relative flex justify-end px-2", open ? "z-50" : "z-30")}
    >
      <IconButton
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          "border-white/14 bg-white/7 text-glass-secondary hover:border-white/14 hover:bg-white/7 hover:text-glass-secondary",
          open && "invisible",
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical className="size-3.5" />
      </IconButton>

      {open && (
        <GlassPanel
          role="menu"
          variant="subtle"
          intensity="high"
          elevation="solid"
          className="absolute right-0 top-0 z-50 w-44 rounded-xl p-1.5"
        >
          {actions.map((action) => (
            <GhostButton
              key={action.label}
              role="menuitem"
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
