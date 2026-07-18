"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/button/Button";
import { GlassButton } from "@/components/common/button/GlassButton";
import { IconButton } from "@/components/common/button/IconButton";
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
          <IconButton
            size="md"
            variant="glass"
            aria-label="Período anterior"
            className="sm:order-1"
            onClick={() => shift(-1)}
          >
            <ChevronLeft className="size-4" />
          </IconButton>

          <IconButton
            size="md"
            variant="glass"
            aria-label="Próximo período"
            className="sm:order-3"
            onClick={() => shift(1)}
          >
            <ChevronRight className="size-4" />
          </IconButton>

          <GlassButton
            type="button"
            size="sm"
            variant="subtle"
            shape="pill"
            className="sm:order-4"
            onClick={goToToday}
          >
            Hoje
          </GlassButton>
        </div>
      </div>

      <div className="inline-flex items-center gap-1 self-center rounded-full border border-white/10 bg-white/[0.04] p-1 sm:self-auto">
        {VIEW_OPTIONS.map(({ value, label: optionLabel }) => {
          const isActive = viewMode === value;

          return (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={isActive ? "primary" : "ghost"}
              onClick={() => onViewModeChange(value)}
            >
              {optionLabel}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
