"use client";

import { useDragScroll } from "@/hooks/useDragScroll";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import type { FinancialChartBar } from "./types";

type HealthBarsChartProps = {
  bars: FinancialChartBar[];
  wideColumns?: boolean;
  className?: string;
};

const BAR_COLORS = ["#FFB300", "#FF7A4A"] as const;
const MIN_BAR_HEIGHT_PERCENT = 12;
const SCROLLABLE_BAR_COUNT = 7;
const COMPACT_COLUMN_CLASS = "w-4 shrink-0 sm:w-5";
const WIDE_COLUMN_CLASS = "w-8 shrink-0 sm:w-9";
const COMPACT_GAP_CLASS = "gap-[2px] sm:gap-0.5";
const WIDE_GAP_CLASS = "gap-1.5 sm:gap-2";

function resolveColumnClass(
  wideColumns: boolean,
  isScrollable: boolean,
  barCount: number,
): string {
  if (barCount === 1) {
    return wideColumns ? WIDE_COLUMN_CLASS : COMPACT_COLUMN_CLASS;
  }

  if (wideColumns && isScrollable) return WIDE_COLUMN_CLASS;
  if (wideColumns) return "min-w-8 flex-1 shrink-0 sm:min-w-9";
  if (isScrollable) return COMPACT_COLUMN_CLASS;
  return "min-w-0 flex-1";
}

export function HealthBarsChart({
  bars,
  wideColumns = false,
  className,
}: HealthBarsChartProps) {
  const { ref: scrollRef, handleMouseDown } = useDragScroll<HTMLDivElement>();

  if (bars.length === 0) return null;

  const maxValue = Math.max(...bars.map((bar) => bar.value), 0);
  const scaleMax = maxValue > 0 ? maxValue : 1;
  const isScrollable = bars.length > SCROLLABLE_BAR_COUNT;
  const isSingleBar = bars.length === 1;
  const columnClass = resolveColumnClass(wideColumns, isScrollable, bars.length);
  const gapClass = wideColumns ? WIDE_GAP_CLASS : COMPACT_GAP_CLASS;
  const rowWidthClass = isSingleBar ? "w-fit" : isScrollable ? "" : "w-full";

  const chartContent = (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        isScrollable && "w-max min-w-full",
        isSingleBar && "w-fit",
      )}
    >
      <div
        className={cn(
          "flex items-end sm:h-16",
          gapClass,
          rowWidthClass,
          isScrollable || isSingleBar ? "h-14" : "h-14 sm:h-16",
        )}
        role="img"
        aria-label="Gráfico de receitas"
      >
        {bars.map((bar, index) => {
          const heightPercent =
            maxValue === 0
              ? MIN_BAR_HEIGHT_PERCENT
              : Math.max(
                  MIN_BAR_HEIGHT_PERCENT,
                  Math.round((bar.value / scaleMax) * 100),
                );

          return (
            <span
              key={`${bar.label}-${index}`}
              className={cn("rounded-full", columnClass)}
              style={{
                height: `${heightPercent}%`,
                backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
              }}
              title={`${bar.label}: R$ ${bar.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          );
        })}
      </div>

      <div className={cn("flex", gapClass, rowWidthClass)}>
        {bars.map((bar, index) => (
          <span
            key={`label-${bar.label}-${index}`}
            className={cn(
              "whitespace-nowrap text-center text-[9px] tracking-[-0.02em] sm:text-[10px]",
              wideColumns ? columnClass : cn(columnClass, !isScrollable && "truncate"),
              glassText.muted,
            )}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("w-full", isSingleBar && "flex justify-center", className)}>
      {isScrollable ? (
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          className={cn(
            "cursor-grab overflow-x-auto pb-1 select-none",
            "[-ms-overflow-style:none] [scrollbar-width:thin]",
            "[&::-webkit-scrollbar]:h-1",
            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20",
            "[&::-webkit-scrollbar-track]:bg-transparent",
          )}
        >
          {chartContent}
        </div>
      ) : (
        chartContent
      )}
    </div>
  );
}
