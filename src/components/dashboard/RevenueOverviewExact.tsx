"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { GlassSelect } from "@/components/common/select/GlassSelect";
import { RevenueOverviewExactSkeleton } from "@/components/dashboard/RevenueOverviewExactSkeleton";
import { formatBrlAmount, formatRevenueTooltipLabel, resolveRevenueChartLayout } from "@/components/finance/finance.helpers";
import { brand } from "@/config/brand-colors";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useToastOnError } from "@/hooks/useToastOnError";
import {
  computeRevenueVariation,
  REVENUE_CHART_FILTER_LABELS,
  REVENUE_CHART_FILTER_OPTIONS,
  useRevenueChartData,
  type RevenueChartFilter,
} from "@/hooks/useRevenueChartData";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/lib/cn";

const REVENUE_FILTER_SELECT_OPTIONS = REVENUE_CHART_FILTER_OPTIONS.map((value) => ({
  value,
  label: REVENUE_CHART_FILTER_LABELS[value],
}));

export { RevenueOverviewExactSkeleton as RevenueOverviewExactLoading } from "@/components/dashboard/RevenueOverviewExactSkeleton";

type RevenueBar = {
  label: string;
  value: number;
  date: string;
  percentage: number;
  highlighted?: boolean;
};

type HoveredRevenueBar = {
  label: string;
  value: number;
  anchorX: number;
  anchorY: number;
  placement: "top" | "bottom";
};

function RevenueBarTooltip({ label, value }: { label: string; value: number }) {
  return (
    <GlassPanel
      elevation="popover"
      intensity="medium"
      className="pointer-events-none z-50 min-w-36 rounded-xl px-3 py-2 shadow-lg"
    >
      <p className={cn("text-[10px] font-semibold", glassText.primary)}>{label}</p>
      <p className={cn("mt-1 text-[10px]", glassText.secondary)}>
        Receita:{" "}
        <span className={cn("font-semibold", glassText.primary)}>
          R$ {formatBrlAmount(value)}
        </span>
      </p>
    </GlassPanel>
  );
}

const CHART_MAX_HEIGHT = 132;
const HIGHLIGHT_ACCENT = brand.orange;

/** Escala logarítmica: comprime picos e mantém dias com receita menor visíveis. */
function computeBarHeight(value: number, maxRevenue: number): number {
  if (value <= 0 || maxRevenue <= 0) return 0;
  if (value >= maxRevenue) return CHART_MAX_HEIGHT;

  const logRatio = Math.log10(value) / Math.log10(maxRevenue);
  const height = Math.round(logRatio * CHART_MAX_HEIGHT);

  return height > 0 ? height : 4;
}

const REVENUE_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

type RevenueGlassProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

function RevenueGlass({ className, style, children }: RevenueGlassProps) {
  return (
    <GlassPanel {...REVENUE_GLASS} className={className} style={style}>
      {children}
    </GlassPanel>
  );
}

function formatVariation(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}%`;
  return `${rounded}%`;
}

const BAR_HATCH_HEIGHT_PERCENT = 38;

const barHatchStyle: CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.14) 0px,
    rgba(255, 255, 255, 0.14) 1.5px,
    transparent 1.5px,
    transparent 5px
    
  )`,
};

type RevenueBarColumnProps = {
  bar: RevenueBar;
  maxRevenueInPeriod: number;
  columnWidth?: number;
  onBarEnter: (bar: RevenueBar, element: HTMLElement) => void;
  onBarLeave: () => void;
};

function RevenueBarColumn({
  bar,
  maxRevenueInPeriod,
  columnWidth,
  onBarEnter,
  onBarLeave,
}: RevenueBarColumnProps) {
  const barHeightPx = computeBarHeight(bar.value, maxRevenueInPeriod);
  const visibleBarHeight = barHeightPx;
  const hatchHeight = `${BAR_HATCH_HEIGHT_PERCENT}%`;
  const isPositive = bar.percentage >= 0;

  return (
    <div
      className={cn(
        "relative z-10 flex min-h-[calc(132px+1.25rem)] min-w-0 cursor-default flex-col items-center justify-end",
        columnWidth === undefined && "flex-1",
        bar.highlighted && "z-20",
      )}
      style={columnWidth !== undefined ? { width: columnWidth, flexShrink: 0 } : undefined}
      onMouseEnter={(event) => onBarEnter(bar, event.currentTarget)}
      onMouseLeave={onBarLeave}
    >
      {bar.highlighted && bar.value > 0 && (
        <span
          aria-hidden
          className="absolute z-30 size-2.5 rounded-full border-2 border-white/90 bg-orange-500 shadow-[0_0_0_2px_#FF7A00,0_0_10px_rgba(255,122,0,0.85)]"
          style={{ bottom: visibleBarHeight - 4 }}
        />
      )}

      {bar.value > 0 ? (
        <RevenueGlass
          className="relative z-10 w-full min-w-[16px] rounded-full"
          style={{ height: visibleBarHeight }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-white/10" />

            {bar.highlighted ? (
              <>
                <div
                  className="absolute inset-x-0 bottom-0 top-[28%] z-[1]"
                  style={{ backgroundColor: HIGHLIGHT_ACCENT }}
                />
                <div
                  className="absolute inset-x-0 top-0 z-[2] bg-orange-500"
                  style={{ height: hatchHeight, ...barHatchStyle }}
                />
              </>
            ) : (
              <>
                <div
                  className="absolute inset-x-0 top-0 z-[1] bg-transparent"
                  style={{ height: hatchHeight, ...barHatchStyle }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 z-[1] bg-orange-500"
                  style={{ top: hatchHeight }}
                />
              </>
            )}

            {visibleBarHeight >= 20 ? (
              <span
                className={cn(
                  "absolute inset-x-0 bottom-[22%] z-[3] text-center text-[9px] font-medium leading-none tracking-[-0.02em]",
                  isPositive ? "text-emerald-400" : "text-red-400",
                )}
              >
                {formatVariation(bar.percentage)}
              </span>
            ) : null}
          </div>
        </RevenueGlass>
      ) : null}

      <span className={cn("mt-1.5 text-[9px] font-medium tracking-[-0.01em]", glassText.muted)}>
        {bar.label}
      </span>
    </div>
  );
}

/** Altura reservada para o badge do pico acima da coluna. */
const PEAK_CALLOUT_HEIGHT = 40;

type RevenueOverviewExactProps = {
  filter?: RevenueChartFilter;
  onFilterChange?: (filter: RevenueChartFilter) => void;
};

export function RevenueOverviewExact({
  filter: controlledFilter,
  onFilterChange,
}: RevenueOverviewExactProps) {
  const [internalFilter, setInternalFilter] = useState<RevenueChartFilter>("yearly");
  const filter = controlledFilter ?? internalFilter;
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const chartPlotRef = useRef<HTMLDivElement>(null);
  const chartContentRef = useRef<HTMLDivElement>(null);
  const { ref: scrollRef, handleMouseDown } = useDragScroll<HTMLDivElement>();
  const [chartAreaWidth, setChartAreaWidth] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<HoveredRevenueBar | null>(null);

  const { bars, totalRevenue, isLoading, error } = useRevenueChartData(filter);

  useToastOnError(error);

  useEffect(() => {
    const element = chartAreaRef.current;
    if (!element) return;

    const updateWidth = () => setChartAreaWidth(element.clientWidth);

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isLoading, filter]);

  const { displayBars, maxRevenueInPeriod, peakBarIndex, peakValue } = useMemo(() => {
    const maxRevenue = bars.reduce((max, bar) => Math.max(max, bar.value), 0);

    const peakIndex = bars.reduce(
      (bestIndex, bar, index, list) => (bar.value > list[bestIndex].value ? index : bestIndex),
      0,
    );

    const enrichedBars: RevenueBar[] = bars.map((bar, index) => ({
      label: bar.label,
      value: bar.value,
      date: bar.date,
      percentage:
        index === 0 ? 0 : computeRevenueVariation(bar.value, bars[index - 1]?.value ?? 0),
      highlighted: index === peakIndex && maxRevenue > 0,
    }));

    return {
      displayBars: enrichedBars,
      maxRevenueInPeriod: maxRevenue,
      peakBarIndex: peakIndex,
      peakValue: bars[peakIndex]?.value ?? 0,
    };
  }, [bars]);

  const barCount = displayBars.length;
  const { columnWidth: barColumnWidth, gap: barGap, contentWidth, isScrollable } =
    resolveRevenueChartLayout(filter, barCount, chartAreaWidth);

  const peakCenterX =
    peakBarIndex * (barColumnWidth + barGap) + barColumnWidth / 2;

  const showPeakCallout = displayBars.length > 0 && maxRevenueInPeriod > 0;

  function handleBarEnter(bar: RevenueBar, element: HTMLElement) {
    const chartEl = chartPlotRef.current;
    if (!chartEl) return;

    const barRect = element.getBoundingClientRect();
    const chartRect = chartEl.getBoundingClientRect();
    const anchorX = barRect.left + barRect.width / 2 - chartRect.left;
    const anchorY = barRect.top - chartRect.top;
    const placement = anchorY <= 64 ? "bottom" : "top";

    setHoveredBar({
      label: formatRevenueTooltipLabel(bar.date, filter),
      value: bar.value,
      anchorX,
      anchorY,
      placement,
    });
  }

  function handleBarLeave() {
    setHoveredBar(null);
  }

  const chartContent = (
    <div
      ref={chartContentRef}
      className="relative"
      style={{ width: contentWidth }}
    >
      {showPeakCallout ? (
        <div
          className="pointer-events-none absolute top-0 z-20 flex -translate-x-1/2 flex-col items-center"
          style={{ left: peakCenterX, height: PEAK_CALLOUT_HEIGHT }}
        >
          <RevenueGlass className="shrink-0 rounded-full">
            <span
              className="block whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold tracking-[-0.03em] sm:px-2.5 sm:py-1 sm:text-[12px]"
              style={{ color: HIGHLIGHT_ACCENT }}
            >
              R$ {formatBrlAmount(peakValue)}
            </span>
          </RevenueGlass>
          <div aria-hidden className="w-px flex-1 bg-white/40" />
        </div>
      ) : null}

      <div
        className="relative z-10 flex items-end"
        style={{
          gap: barGap,
          paddingTop: showPeakCallout ? PEAK_CALLOUT_HEIGHT : 0,
        }}
      >
        {displayBars.map((bar, index) => (
          <RevenueBarColumn
            key={`${filter}-${index}`}
            bar={bar}
            maxRevenueInPeriod={maxRevenueInPeriod}
            columnWidth={barColumnWidth}
            onBarEnter={handleBarEnter}
            onBarLeave={handleBarLeave}
          />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <RevenueOverviewExactSkeleton />;
  }

  return (
    <RevenueGlass className="w-full rounded-2xl px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="flex gap-3 sm:flex-row sm:items-center justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className={cn(glassText.primary, "text-base font-semibold tracking-[-0.04em]")}>
            Faturamento Gerado
          </h2>
          <p className={cn(glassText.muted, "mt-0.5 text-[11px] leading-snug")}>
            Fique de olho no seu faturamento!
          </p>
        </div>
          <GlassSelect
            aria-label="Período de receitas"
            selectSize="sm"
            tone="muted"
            value={filter}
            options={REVENUE_FILTER_SELECT_OPTIONS}
            onChange={(event) => {
              const nextFilter = event.target.value as RevenueChartFilter;
              if (onFilterChange) {
                onFilterChange(nextFilter);
              } else {
                setInternalFilter(nextFilter);
              }
            }}
            className="max-w-24"
            wrapperClassName="flex items-center justify-center"
      />
      </div>

      <div className="relative mt-4 flex flex-col gap-3 sm:mt-5">
        <div className="z-10 flex shrink-0 flex-col items-start self-start">
          <RevenueGlass className="min-w-0 max-w-full rounded-full">
            <div className="inline-flex max-w-full items-baseline truncate px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5">
              <span
                className={cn(
                  "mr-0.5 shrink-0 text-base font-semibold tracking-tighter sm:mr-1 sm:text-xl md:text-2xl",
                  glassText.tertiary,
                )}
              >
                R$
              </span>
              <span
                className={cn(
                  glassTextStyles.kpiValue,
                  "truncate text-base sm:text-xl md:text-2xl",
                )}
              >
                {formatBrlAmount(totalRevenue)}
              </span>
            </div>
          </RevenueGlass>
        </div>

        <div
          ref={chartPlotRef}
          className="relative min-w-0 w-full overflow-visible"
          onMouseLeave={handleBarLeave}
        >
          <div ref={chartAreaRef} className="relative min-w-0">
            <div
              ref={isScrollable ? scrollRef : undefined}
              onMouseDown={isScrollable ? handleMouseDown : undefined}
              className={cn(
                "w-full",
                !isScrollable && "flex justify-center",
                isScrollable &&
                  "cursor-grab overflow-x-auto overflow-y-hidden pb-1 select-none active:cursor-grabbing",
                isScrollable &&
                  "[-ms-overflow-style:none] [scrollbar-width:thin]",
                isScrollable &&
                  "[&::-webkit-scrollbar]:h-1",
                isScrollable &&
                  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20",
                isScrollable &&
                  "[&::-webkit-scrollbar-track]:bg-transparent",
              )}
            >
              {chartContent}
            </div>
          </div>

          {hoveredBar ? (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                left: hoveredBar.anchorX,
                top: hoveredBar.anchorY,
                transform:
                  hoveredBar.placement === "top"
                    ? "translate(-50%, calc(-100% - 8px))"
                    : "translate(-50%, 8px)",
              }}
            >
              <RevenueBarTooltip label={hoveredBar.label} value={hoveredBar.value} />
            </div>
          ) : null}
        </div>
      </div>
    </RevenueGlass>
  );
}
