"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { type EventType } from "@/components/agenda/agenda.types";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const CALENDAR_OPTIONS = [
  { id: "reuniao" as const, label: "Reuniões" },
  { id: "tarefa" as const, label: "Tarefas" },
  { id: "compromisso" as const, label: "Compromissos" },
];

type MyCalendarsSectionProps = {
  categoryCounts: Record<EventType, number>;
  className?: string;
};

export function MyCalendarsSection({ categoryCounts, className }: MyCalendarsSectionProps) {
  const [open, setOpen] = useState(true);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    reuniao: true,
    tarefa: true,
    compromisso: true,
  });

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className={cn("w-full min-w-0 rounded-[20px] p-4", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-0.5 py-0.5 transition hover:bg-white/[0.04]"
      >
        <span className={cn("text-xs font-semibold", glassText.secondary)}>Meu Calendário</span>
        <ChevronDown className={cn("size-4 shrink-0 transition", glassText.muted, open && "rotate-180")} />
      </button>

      {open ? (
        <ul className="mt-3 space-y-0.5">
          {CALENDAR_OPTIONS.map((option) => {
            const checked = enabled[option.id] ?? true;
            const badge = categoryCounts[option.id] ?? 0;

            return (
              <li key={option.id}>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-1 py-2 transition hover:bg-white/[0.05]">
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setEnabled((current) => ({
                          ...current,
                          [option.id]: !checked,
                        }))
                      }
                      className="size-4 shrink-0 rounded-md border border-white/20 bg-white/5 accent-orange-500"
                    />
                    <span className={cn("truncate text-xs font-medium", glassText.primary)}>
                      {option.label}
                    </span>
                  </span>
                  {badge > 0 ? (
                    <span className="shrink-0 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold leading-none text-orange-200">
                      {badge}
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </GlassPanel>
  );
}
