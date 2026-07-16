"use client";

import { Calendar, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassButton } from "@/components/common/button/GlassButton";
import { DatePicker } from "@/components/common/date-picker/DatePicker";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import type { FinanceFilter, FinancePeriod } from "@/components/finance/finance.types";
import {
  formatFinanceFilterLabel,
  resolveFinanceFilterDates,
  toIsoDate,
} from "@/components/finance/finance.helpers";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type FinanceHeaderPeriod = Extract<FinancePeriod, "today" | "thisWeek" | "thisMonth">;

type FinanceHeaderProps = {
  activeFilter: FinanceFilter;
  onPeriodChange?: (period: FinanceHeaderPeriod) => void;
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  onExportClick?: () => void;
};

const navButtonClass = cn(
  "inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition hover:border-white/16 hover:bg-white/10",
  glassText.secondary,
);

const activePeriodClass = cn(
  "rounded-full border-transparent bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-xs font-semibold shadow-[0_4px_16px_rgba(249,115,22,0.32)]",
  glassText.primary,
);

const PERIOD_OPTIONS: { value: FinanceHeaderPeriod; label: string }[] = [
  { value: "today", label: "Dia" },
  { value: "thisWeek", label: "Semana" },
  { value: "thisMonth", label: "Mês" },
];

function formatIsoAsBr(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function getFilterDateLabel(filter: FinanceFilter): string {
  if (filter.kind === "range") {
    return formatFinanceFilterLabel(filter);
  }

  const { start, end } = resolveFinanceFilterDates(filter);

  if (start === end) {
    return formatIsoAsBr(start);
  }

  return `${formatIsoAsBr(start)} – ${formatIsoAsBr(end)}`;
}

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
  const dateLabel = getFilterDateLabel(activeFilter);

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
    <header className="flex w-full flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className={glassTextStyles.pageTitle}>Resumo Financeiro</h1>
        <div className="flex items-center gap-2">
          <p className={cn(glassText.muted, "leading-none text-sm font-normal")}>
            Acompanhe todas as movimentações financeiras
          </p>
          <button
            type="button"
            aria-label="Exportar"
            onClick={onExportClick}
            className={cn(navButtonClass, "size-7 shrink-0")}
          >
            <Download className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:w-auto">
        <div ref={datePanelRef} className="relative">
          <button
            type="button"
            onClick={openDatePanel}
            aria-expanded={datePanelOpen}
            className={cn(
              "inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium transition hover:border-white/16 hover:bg-white/10",
              glassText.primary,
              isCustomRangeActive &&
                "border-transparent bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_4px_16px_rgba(249,115,22,0.32)]",
            )}
          >
            <Calendar
              className={cn(
                "size-4 shrink-0",
                isCustomRangeActive ? glassText.primary : glassText.secondary,
              )}
              strokeWidth={2}
            />
            {dateLabel}
          </button>

          {datePanelOpen ? (
            <GlassPanel
              elevation="popover"
              intensity="medium"
              className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[min(20rem,calc(100vw-2rem))] rounded-2xl p-4 sm:left-auto sm:right-0"
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

        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {PERIOD_OPTIONS.map(({ value, label }) => {
            const isActive = activeFilter.kind === "period" && activeFilter.period === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onPeriodChange?.(value)}
                className={cn(
                  "px-3 py-1.5 text-xs transition",
                  isActive
                    ? activePeriodClass
                    : cn("rounded-full font-medium hover:text-glass-primary", glassText.muted),
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
