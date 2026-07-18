"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { eventTypeCategoryAccent, type EventType } from "@/components/agenda/agenda.types";
import { computeCategoryProgress } from "@/components/dashboard/right-sidebar/right-sidebar.helpers";
import { GhostButton } from "@/components/common/button/GhostButton";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const CATEGORY_ITEMS = [
  { id: "reuniao" as const, label: "Reuniões" },
  { id: "tarefa" as const, label: "Tarefas" },
  { id: "compromisso" as const, label: "Compromissos" },
];

type CategoriesSectionProps = {
  categoryCounts: Record<EventType, number>;
  className?: string;
};

export function CategoriesSection({ categoryCounts, className }: CategoriesSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className={cn("w-full min-w-0 rounded-[20px] p-4", className)}
    >
      <GhostButton
        type="button"
        size="sm"
        fullWidth
        onClick={() => setOpen((current) => !current)}
        className="justify-between"
        rightIcon={
          <ChevronDown
            className={cn("size-4 shrink-0 transition", glassText.muted, open && "rotate-180")}
          />
        }
      >
        <span className={cn("text-xs font-semibold", glassText.secondary)}>Categorias</span>
      </GhostButton>

      {open ? (
        <ul className="mt-3 space-y-3">
          {CATEGORY_ITEMS.map((category) => {
            const count = categoryCounts[category.id] ?? 0;
            const progress = computeCategoryProgress(count);
            const accent = eventTypeCategoryAccent[category.id];

            return (
              <li key={category.id} className="px-1 py-0.5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent.color }}
                    />
                    <span className={cn("truncate text-xs font-medium", glassText.primary)}>
                      {category.label}
                    </span>
                  </span>
                  <span className={cn("shrink-0 text-[10px] tabular-nums", glassText.muted)}>
                    {count}
                  </span>
                </div>

                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: accent.trackColor }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: accent.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </GlassPanel>
  );
}
