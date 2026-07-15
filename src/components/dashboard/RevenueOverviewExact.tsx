"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SquareArrowUp } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { RevenueOverviewExactSkeleton } from "@/components/dashboard/RevenueOverviewExactSkeleton";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { formatBrlAmount, formatRevenueTooltipLabel, resolveRevenueChartLayout } from "@/components/finance/finance.helpers";
import { brand } from "@/config/brand-colors";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import {
  computeRevenueVariation,
  REVENUE_CHART_FILTER_LABELS,
  REVENUE_CHART_FILTER_OPTIONS,
  useRevenueChartData,
  type RevenueChartFilter,
} from "@/hooks/useRevenueChartData";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/lib/cn";

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

const CONNECTOR_HEIGHT = 28;
const CONNECTOR_LINE_Y = 22;

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
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const chartPlotRef = useRef<HTMLDivElement>(null);
  const chartRowRef = useRef<HTMLDivElement>(null);
  const kpiRef = useRef<HTMLDivElement>(null);
  const peakBadgeRef = useRef<HTMLDivElement>(null);
  const chartContentRef = useRef<HTMLDivElement>(null);
  const { ref: scrollRef, handleMouseDown } = useDragScroll<HTMLDivElement>();
  const [chartAreaWidth, setChartAreaWidth] = useState(0);
  const [connectorLayout, setConnectorLayout] = useState({
    lineLeft: 0,
    lineWidth: 0,
    bottom: 0,
  });
  const [hoveredBar, setHoveredBar] = useState<HoveredRevenueBar | null>(null);

  const { bars, totalRevenue, isLoading, error } = useRevenueChartData(filter);

  useEffect(() => {
    const element = chartAreaRef.current;
    if (!element) return;

    const updateWidth = () => setChartAreaWidth(element.clientWidth);

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isLoading, filter]);

  useEffect(() => {
    if (!filterOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!filterRef.current?.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filterOpen]);

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

  const showConnector = displayBars.length > 0 && maxRevenueInPeriod > 0;

  useEffect(() => {
    if (!showConnector) return;

    function updateConnectorLine() {
      const row = chartRowRef.current;
      const kpi = kpiRef.current;
      const badge = peakBadgeRef.current;
      const content = chartContentRef.current;
      if (!row || !kpi || !content) return;

      const rowRect = row.getBoundingClientRect();
      const badgeRect = badge?.getBoundingClientRect();
      const kpiRect = kpi.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();

      const lineLeft = badgeRect
        ? badgeRect.right - rowRect.left + 4
        : kpiRect.left - rowRect.left;
      const peakX = contentRect.left - rowRect.left + peakCenterX;
      const lineBottom = badgeRect
        ? rowRect.bottom - (badgeRect.top + badgeRect.height / 2)
        : rowRect.bottom - contentRect.top - CONNECTOR_LINE_Y;

      setConnectorLayout({
        lineLeft,
        lineWidth: Math.max(peakX - lineLeft, 0),
        bottom: Math.max(lineBottom, 0),
      });
    }

    updateConnectorLine();

    const row = chartRowRef.current;
    const scrollEl = scrollRef.current;
    const observer = new ResizeObserver(updateConnectorLine);

    if (row) observer.observe(row);
    if (chartAreaRef.current) observer.observe(chartAreaRef.current);
    if (chartContentRef.current) observer.observe(chartContentRef.current);
    if (peakBadgeRef.current) observer.observe(peakBadgeRef.current);
    scrollEl?.addEventListener("scroll", updateConnectorLine, { passive: true });
    window.addEventListener("resize", updateConnectorLine);

    return () => {
      observer.disconnect();
      scrollEl?.removeEventListener("scroll", updateConnectorLine);
      window.removeEventListener("resize", updateConnectorLine);
    };
  }, [showConnector, peakCenterX, isScrollable, contentWidth, filter, isLoading]);

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
      <div
        className="relative z-10 flex items-end"
        style={{
          gap: barGap,
          paddingTop: showConnector ? CONNECTOR_HEIGHT - 14 : 0,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className={cn(glassText.primary, "text-base font-semibold tracking-[-0.04em]")}>
            Receitas Totais
          </h2>
          <p className={cn(glassText.muted, "mt-0.5 text-[11px] leading-snug")}>
            fique de olho nas receitas totais geradas
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-start">
          <div ref={filterRef} className="relative">
            <RevenueGlass className="rounded-full">
              <button
                type="button"
                aria-expanded={filterOpen}
                aria-haspopup="listbox"
                onClick={() => setFilterOpen((current) => !current)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/8",
                  glassText.secondary,
                )}
              >
                {REVENUE_CHART_FILTER_LABELS[filter]}
                <ChevronDown className={cn("size-3", glassText.tertiary)} strokeWidth={2.25} />
              </button>
            </RevenueGlass>

            {filterOpen ? (
              <RevenueGlass className="absolute right-0 z-50 mt-1.5 min-w-[9rem] rounded-xl py-1">
                <ul role="listbox" aria-label="Período de receitas">
                  {REVENUE_CHART_FILTER_OPTIONS.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={filter === option}
                        onClick={() => {
                          if (onFilterChange) {
                            onFilterChange(option);
                          } else {
                            setInternalFilter(option);
                          }
                          setFilterOpen(false);
                        }}
                        className={cn(
                          "w-full px-3 py-1.5 text-left text-[11px] font-medium transition-colors hover:bg-white/8",
                          filter === option ? glassText.primary : glassText.secondary,
                        )}
                      >
                        {REVENUE_CHART_FILTER_LABELS[option]}
                      </button>
                    </li>
                  ))}
                </ul>
              </RevenueGlass>
            ) : null}
          </div>

        </div>
      </div>

      {error ? (
        <div className="mt-3">
          <InlineAlert>{error}</InlineAlert>
        </div>
      ) : null}

      <div ref={chartRowRef} className="relative mt-4 flex items-end gap-3 sm:mt-5 sm:gap-4">
        {showConnector ? (
          <div
            aria-hidden
            className="pointer-events-none absolute z-[1] h-px bg-white/40"
            style={{
              left: connectorLayout.lineLeft,
              width: connectorLayout.lineWidth,
              bottom: connectorLayout.bottom,
            }}
          />
        ) : null}

        <div ref={kpiRef} className="z-10 mb-4 flex shrink-0 flex-col items-start gap-2 self-end">
          {showConnector ? (
            <div ref={peakBadgeRef} className="shrink-0">
              <RevenueGlass className="rounded-full">
                <span
                  className="block whitespace-nowrap px-2.5 py-1 text-[12px] font-semibold tracking-[-0.03em]"
                  style={{ color: HIGHLIGHT_ACCENT }}
                >
                  R$ {formatBrlAmount(peakValue)}
                </span>
              </RevenueGlass>
            </div>
          ) : null}

          <RevenueGlass className="rounded-full">
            <div className="inline-flex items-baseline px-4 py-2 sm:px-5 sm:py-2.5">
              <span
                className={cn(
                  "mr-1 text-xl font-semibold tracking-tighter sm:text-2xl",
                  glassText.tertiary,
                )}
              >
                R$
              </span>
              <span className={cn(glassTextStyles.kpiValue, "text-xl sm:text-2xl")}>
                {formatBrlAmount(totalRevenue)}
              </span>
            </div>
          </RevenueGlass>
        </div>

        <div
          ref={chartPlotRef}
          className="relative min-w-0 flex-1 overflow-visible"
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
