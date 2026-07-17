"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatAgendaReferenceLabel,
  shiftReferenceDate,
  type AgendaViewMode,
} from "@/components/classes/class-schedule.helpers";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type AgendaDateFilterProps = {
  viewMode: AgendaViewMode;
  referenceDate: Date;
  onViewModeChange: (mode: AgendaViewMode) => void;
  onReferenceDateChange: (date: Date) => void;
  className?: string;
};

const VIEW_OPTIONS: { value: AgendaViewMode; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

const navButtonClass = cn(
  "inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition hover:border-white/16 hover:bg-white/10",
  glassText.secondary,
);

const activeViewClass = cn(
  "rounded-full border-transparent bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-xs font-semibold shadow-[0_4px_16px_rgba(249,115,22,0.32)]",
  glassText.primary,
);

export function AgendaDateFilter({
  viewMode,
  referenceDate,
  onViewModeChange,
  onReferenceDateChange,
  className,
}: AgendaDateFilterProps) {
  const label = formatAgendaReferenceLabel(referenceDate, viewMode);

  function goToToday() {
    onReferenceDateChange(new Date());
  }

  function shift(direction: -1 | 1) {
    onReferenceDateChange(shiftReferenceDate(referenceDate, viewMode, direction));
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/*
        Mobile: data em cima; setas + Hoje abaixo, centralizados.
        sm+: ← data → Hoje em linha (sm:contents dissolve o wrapper das setas).
      */}
      <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:items-center">
        <div
          className={cn(
            "order-1 inline-flex min-w-[9.5rem] max-w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-center text-xs font-medium",
            "sm:order-2",
            glassText.primary,
          )}
        >
          <Calendar className={cn("size-4 shrink-0", glassText.secondary)} strokeWidth={2} />
          <span className="truncate">{label}</span>
        </div>

        <div className="order-2 flex items-center justify-center gap-2 sm:contents">
          <button
            type="button"
            aria-label="Período anterior"
            className={cn(navButtonClass, "sm:order-1")}
            onClick={() => shift(-1)}
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Próximo período"
            className={cn(navButtonClass, "sm:order-3")}
            onClick={() => shift(1)}
          >
            <ChevronRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={goToToday}
            className={cn(
              "rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium transition hover:bg-white/10 sm:order-4",
              glassText.secondary,
            )}
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 self-center rounded-full border border-white/10 bg-white/[0.04] p-1 sm:self-auto">
        {VIEW_OPTIONS.map(({ value, label: optionLabel }) => {
          const isActive = viewMode === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onViewModeChange(value)}
              className={cn(
                "px-3 py-1.5 text-xs transition",
                isActive
                  ? activeViewClass
                  : cn("rounded-full font-medium hover:text-glass-primary", glassText.muted),
              )}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
