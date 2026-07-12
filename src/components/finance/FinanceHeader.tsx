"use client";

import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type FinancePeriod = "today" | "thisMonth";

type FinanceHeaderProps = {
  defaultPeriod?: FinancePeriod;
  onPeriodChange?: (period: FinancePeriod) => void;
  onDateClick?: () => void;
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

export function FinanceHeader({
  defaultPeriod = "thisMonth",
  onPeriodChange,
  onDateClick,
  onExportClick,
}: FinanceHeaderProps) {
  const [activePeriod, setActivePeriod] = useState<FinancePeriod>(defaultPeriod);

  function handlePeriodChange(period: FinancePeriod) {
    setActivePeriod(period);
    onPeriodChange?.(period);
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
        <button
          type="button"
          onClick={() => handlePeriodChange("today")}
          className={cn(
            "text-sm transition",
            activePeriod === "today"
              ? activePeriodClass
              : cn("font-normal hover:text-glass-primary", glassText.secondary),
          )}
        >
          Hoje
        </button>

        <button
          type="button"
          onClick={() => handlePeriodChange("thisMonth")}
          className={cn(
            "text-sm transition",
            activePeriod === "thisMonth"
              ? activePeriodClass
              : cn("font-normal hover:text-glass-primary", glassText.secondary),
          )}
        >
          Este mês
        </button>

        <button
          type="button"
          onClick={onDateClick}
          className={cn(controlButtonClass, "gap-2 rounded-xl px-4 py-2 font-medium")}
        >
          <Calendar className={cn("size-4 shrink-0", glassText.secondary)} strokeWidth={2} />
          Data
        </button>

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
