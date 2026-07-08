"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { GhostButton, IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { cn } from "@/lib/cn";

export type RowAction = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "danger";
};

type RowActionsMenuProps = {
  ariaLabel: string;
  actions: RowAction[];
  disabled?: boolean;
};

const ACTION_TONE_CLASSES: Record<NonNullable<RowAction["tone"]>, string> = {
  default: "text-white/75 hover:text-white",
  danger: "text-red-300/85 hover:text-red-200",
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
    setOpen(false);
    action.onSelect();
  }

  return (
    <div ref={containerRef} className="relative z-30 flex justify-end">
      <IconButton
        aria-label={ariaLabel}
        disabled={disabled}
        className="bg-white/7 text-white/70 hover:bg-white/13 hover:text-white"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical className="size-3.5" />
      </IconButton>

      {open && (
        <GlassPanel
          variant="strong"
          intensity="medium"
          elevation="modal"
          className="absolute right-0 top-10 z-50 w-40 rounded-xl bg-[#221d17]/92 p-1.5"
        >
          {actions.map((action) => (
            <GhostButton
              key={action.label}
              disabled={disabled}
              className={cn(
                "w-full justify-start gap-2.5 px-3 py-2 text-left",
                ACTION_TONE_CLASSES[action.tone ?? "default"],
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
