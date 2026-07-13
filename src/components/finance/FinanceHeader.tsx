"use client";

import { Calendar, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassButton } from "@/components/common/button/GlassButton";
import { DatePicker } from "@/components/common/date-picker/DatePicker";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import type { FinanceFilter, FinancePeriod } from "@/components/finance/finance.types";
import { toIsoDate } from "@/components/finance/finance.helpers";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type FinanceHeaderPeriod = Extract<FinancePeriod, "today" | "thisWeek" | "thisMonth">;

type FinanceHeaderProps = {
  activeFilter: FinanceFilter;
  onPeriodChange?: (period: FinanceHeaderPeriod) => void;
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  onExportClick?: () => void;
};

const controlButtonClass = cn(
  "inline-flex items-center justify-center border border-white/10 bg-white/[0.06] text-sm transition hover:border-white/16 hover:bg-white/10",
  glassText.primary,
);

const activePeriodClass = cn(
  "rounded-full border-transparent bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 font-semibold shadow-[0_4px_16px_rgba(249,115,22,0.32)]",
  glassText.primary,
);

const PERIOD_OPTIONS: { value: FinanceHeaderPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "thisWeek", label: "Esta semana" },
  { value: "thisMonth", label: "Este mês" },
];

export function FinanceHeader({
  activeFilter,
  onPeriodChange,
  onDateRangeChange,
  onExportClick,
}: FinanceHeaderProps) {
  const [datePanelOpen, setDatePanelOpen] = useState(false);
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const datePanelRef = useRef<HTMLDivElement>(null);

  const isCustomRangeActive = activeFilter.kind === "range";

  useEffect(() => {
    if (!datePanelOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!datePanelRef.current?.contains(event.target as Node)) {
        setDatePanelOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [datePanelOpen]);

  function openDatePanel() {
    if (activeFilter.kind === "range") {
      setDraftStart(activeFilter.start);
      setDraftEnd(activeFilter.end);
    } else {
      const today = toIsoDate(new Date());
      setDraftStart(today);
      setDraftEnd(today);
    }

    setDatePanelOpen((current) => !current);
  }

  function handleApplyDateRange() {
    if (!draftStart || !draftEnd) return;

    const start = draftStart <= draftEnd ? draftStart : draftEnd;
    const end = draftStart <= draftEnd ? draftEnd : draftStart;

    onDateRangeChange?.({ start, end });
    setDatePanelOpen(false);
  }

  return (
    <header className="flex w-full flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className={cn(glassText.primary, "text-2xl font-semibold leading-tight tracking-[-0.04em]")}>
          Resumo Financeiro
        </h1>
        <p className={cn(glassText.muted, "text-sm font-normal")}>
          Acompanhe todas as movimentações financeiras
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-5 lg:gap-6">
        {PERIOD_OPTIONS.map(({ value, label }) => {
          const isActive = activeFilter.kind === "period" && activeFilter.period === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onPeriodChange?.(value)}
              className={cn(
                "text-sm transition",
                isActive
                  ? activePeriodClass
                  : cn("font-normal hover:text-glass-primary", glassText.secondary),
              )}
            >
              {label}
            </button>
          );
        })}

        <div ref={datePanelRef} className="relative">
          <button
            type="button"
            onClick={openDatePanel}
            aria-expanded={datePanelOpen}
            className={cn(
              controlButtonClass,
              "gap-2 rounded-xl px-4 py-2 font-medium",
              isCustomRangeActive &&
                "border-transparent bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_4px_16px_rgba(249,115,22,0.32)]",
            )}
          >
            <Calendar className={cn("size-4 shrink-0", glassText.secondary)} strokeWidth={2} />
            Data
          </button>

          {datePanelOpen ? (
            <GlassPanel
              elevation="popover"
              intensity="medium"
              className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className={cn("text-xs font-medium", glassText.secondary)}>De</span>
                    <DatePicker
                      value={draftStart}
                      onChange={setDraftStart}
                      pickerSize="sm"
                      tone="muted"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={cn("text-xs font-medium", glassText.secondary)}>Até</span>
                    <DatePicker
                      value={draftEnd}
                      onChange={setDraftEnd}
                      pickerSize="sm"
                      tone="muted"
                    />
                  </label>
                </div>

                <GlassButton
                  size="sm"
                  shape="pill"
                  className="self-end bg-gradient-to-r from-orange-500 to-orange-600 px-5 font-semibold"
                  onClick={handleApplyDateRange}
                  disabled={!draftStart || !draftEnd}
                >
                  Aplicar
                </GlassButton>
              </div>
            </GlassPanel>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Exportar"
          onClick={onExportClick}
          className={cn(controlButtonClass, "size-9 shrink-0 rounded-full")}
        >
          <Download className={cn("size-4", glassText.secondary)} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
