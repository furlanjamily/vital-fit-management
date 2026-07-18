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
  tone?: "default" | "danger" | "accent";
  disabled?: boolean;
};

type RowActionsMenuProps = {
  ariaLabel: string;
  actions: RowAction[];
  disabled?: boolean;
};

const ACTION_TONE_CLASSES: Record<NonNullable<RowAction["tone"]>, string> = {
  default: glassText.primaryElevated,
  danger: "text-red-400 hover:bg-[#9A4A3A] hover:text-red-100",
  accent:
    "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 hover:text-emerald-100",
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
          className="absolute right-0 top-0 z-50 w-48 rounded-2xl p-1.5"
        >
          {actions.map((action) => {
            const isDisabled = disabled || Boolean(action.disabled);
            const tone = action.tone ?? "default";

            return (
              <GhostButton
                key={action.label}
                role="menuitem"
                fullWidth
                size="sm"
                transparent={tone !== "accent"}
                disabled={isDisabled}
                className={cn(
                  "justify-start text-left",
                  ACTION_TONE_CLASSES[tone],
                  isDisabled && "cursor-not-allowed opacity-40",
                )}
                leftIcon={<action.icon className="size-3.5" />}
                onClick={() => handleSelect(action)}
              >
                {action.label}
              </GhostButton>
            );
          })}
        </GlassPanel>
      )}
    </div>
  );
}
