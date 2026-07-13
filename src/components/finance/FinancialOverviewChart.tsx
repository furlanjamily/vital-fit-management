"use client";

import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  fillMissingPeriods,
  formatBrlAmount,
  getAxisLabel,
  getExpectedColumnCount,
} from "@/components/finance/finance.helpers";
import type { FinancialOverviewPeriod } from "@/components/finance/finance.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/lib/cn";

export type FinancialChartColor = "white" | "green" | "orange";

export type FinancialData = {
  date: string;
  revenue: number;
  expense: number;
  balance: number;
};

type FinancialOverviewChartProps = {
  data: FinancialData[];
  period?: FinancialOverviewPeriod;
  range?: { start: string; end: string };
  showLabels?: boolean;
  isLoading?: boolean;
  onMenuClick?: () => void;
  className?: string;
};

type PointKind = "revenue" | "expense" | "balance";

type PlotPoint = {
  id: string;
  kind: PointKind;
  value: number;
};

const CHART_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const COLOR_MAP: Record<FinancialChartColor, string> = {
  white: "#FFFFFF",
  green: "#22C55E",
  orange: "#FF7A00",
};

const BALANCE_NEGATIVE = "#F87171";

const LEGEND_ITEMS: { color: FinancialChartColor; label: string }[] = [
  { color: "green", label: "Receita" },
  { color: "orange", label: "Despesa" },
  { color: "white", label: "Saldo" },
];

const Y_TICK_COUNT = 5;
const Y_SCALE_HEADROOM = 1.22;
const CHART_PLOT_BOTTOM_CLASS = "pb-1.5";
const COLLISION_THRESHOLD_PX = 14;
const HORIZONTAL_OFFSETS = [-8, 0, 8] as const;
const POINT_LABELS: Record<PointKind, string> = {
  revenue: "Receita",
  expense: "Despesa",
  balance: "Saldo",
};

function getDataPeak(data: FinancialData[]): number {
  const peak = data.reduce(
    (max, item) => Math.max(max, item.revenue, item.expense, Math.abs(item.balance)),
    0,
  );
  return peak > 0 ? peak : 1;
}

function getScaleMax(peak: number): number {
  if (peak <= 0) return 1;
  return peak * Y_SCALE_HEADROOM;
}

function sumBalance(data: FinancialData[]): number {
  return data.reduce((sum, item) => sum + item.balance, 0);
}

function formatTotal(data: FinancialData[]): string {
  return formatBrlAmount(sumBalance(data));
}

function formatAxisValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.round(value).toLocaleString("pt-BR");
}

function formatTooltipDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

function valueToBottomPercent(value: number, maxValue: number): number {
  return (Math.abs(value) / maxValue) * 100;
}

function buildPlotPoints(item: FinancialData, columnKey: string): PlotPoint[] {
  return [
    { id: `${columnKey}-revenue`, kind: "revenue", value: item.revenue },
    { id: `${columnKey}-balance`, kind: "balance", value: item.balance },
    { id: `${columnKey}-expense`, kind: "expense", value: item.expense },
  ];
}

function resolveHorizontalOffsets(
  points: PlotPoint[],
  maxValue: number,
  plotHeightPx: number,
): Map<string, number> {
  const active = points.filter((point) => point.value !== 0);
  if (active.length === 0) return new Map();

  const positioned = active
    .map((point) => ({
      ...point,
      bottomPx: (Math.abs(point.value) / maxValue) * plotHeightPx,
    }))
    .sort((a, b) => a.bottomPx - b.bottomPx);

  const offsets = new Map<string, number>();
  let cluster: typeof positioned = [];

  function flushCluster() {
    cluster.forEach((point, index) => {
      offsets.set(point.id, HORIZONTAL_OFFSETS[index] ?? (index - 1) * 8);
    });
    cluster = [];
  }

  for (const point of positioned) {
    if (cluster.length === 0) {
      cluster.push(point);
      continue;
    }

    const last = cluster[cluster.length - 1];
    if (point.bottomPx - last.bottomPx < COLLISION_THRESHOLD_PX) {
      cluster.push(point);
    } else {
      flushCluster();
      cluster.push(point);
    }
  }

  flushCluster();
  return offsets;
}

function pointColor(kind: PointKind, value: number): string {
  if (kind === "revenue") return COLOR_MAP.green;
  if (kind === "expense") return COLOR_MAP.orange;
  return value >= 0 ? "#FFFFFF" : BALANCE_NEGATIVE;
}

type PointTooltipProps = {
  kind: PointKind;
  value: number;
  date: string;
};

function PointTooltip({ kind, value, date }: PointTooltipProps) {
  const isNegative = value < 0;

  return (
    <GlassPanel
      elevation="popover"
      intensity="medium"
      className="pointer-events-none z-40 min-w-36 rounded-xl px-3 py-2 shadow-lg"
    >
      <p className={cn("text-[10px] font-semibold", glassText.primary)}>
        {formatTooltipDate(date)}
      </p>
      <p className={cn("mt-1 text-[10px]", glassText.secondary)}>
        {POINT_LABELS[kind]}:{" "}
        <span
          className={cn(
            "font-semibold",
            kind === "expense" || isNegative ? "text-red-400" : glassText.primary,
          )}
        >
          R$ {formatBrlAmount(Math.abs(value))}
          {isNegative ? " (−)" : ""}
        </span>
      </p>
    </GlassPanel>
  );
}

type HoveredPoint = {
  kind: PointKind;
  value: number;
  date: string;
  anchorX: number;
  anchorY: number;
  placement: "top" | "bottom";
};

type DataPointProps = {
  point: PlotPoint;
  maxValue: number;
  offsetX: number;
  date: string;
  onPointEnter: (point: PlotPoint, element: HTMLElement, date: string) => void;
  onPointLeave: () => void;
};

function DataPoint({
  point,
  maxValue,
  offsetX,
  date,
  onPointEnter,
  onPointLeave,
}: DataPointProps) {
  if (point.value === 0) return null;

  const bottom = valueToBottomPercent(point.value, maxValue);
  const color = pointColor(point.kind, point.value);
  const isRevenue = point.kind === "revenue";

  return (
    <div
      className="absolute left-1/2 z-10"
      style={{
        bottom: `${bottom}%`,
        transform: `translate(calc(-50% + ${offsetX}px), 50%)`,
      }}
    >
      <button
        type="button"
        aria-label={`${POINT_LABELS[point.kind]}: R$ ${formatBrlAmount(Math.abs(point.value))}`}
        onMouseEnter={(event) => onPointEnter(point, event.currentTarget, date)}
        onMouseLeave={onPointLeave}
        onFocus={(event) => onPointEnter(point, event.currentTarget, date)}
        onBlur={onPointLeave}
        className={cn(
          "block rounded-full ring-2 transition-transform hover:scale-125",
          isRevenue && "size-3 ring-white/40",
          point.kind === "expense" && "size-2.5 ring-white/25",
          point.kind === "balance" &&
            cn(
              "size-2.5",
              point.value >= 0 ? "ring-2 ring-green-400" : "ring-2 ring-white/25",
            ),
        )}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

type ChartColumnProps = {
  item: FinancialData;
  maxValue: number;
  plotHeight: number;
  label: string | null;
  period: FinancialOverviewPeriod;
  showLabels: boolean;
  columnKey: string;
  onPointEnter: (point: PlotPoint, element: HTMLElement, date: string) => void;
  onPointLeave: () => void;
};

function ChartColumn({
  item,
  maxValue,
  plotHeight,
  label,
  period,
  showLabels,
  columnKey,
  onPointEnter,
  onPointLeave,
}: ChartColumnProps) {
  const points = buildPlotPoints(item, columnKey);
  const offsets = resolveHorizontalOffsets(points, maxValue, plotHeight);

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col",
        period === "yearly" && "w-8 snap-center sm:w-9",
        period === "weekly" && "min-w-0 flex-1",
        period === "daily" && "w-8 sm:w-9",
        period === "monthly" && "w-6 min-w-[24px] snap-center",
      )}
    >
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10"
          />
          {points.map((point) => (
            <DataPoint
              key={point.id}
              point={point}
              maxValue={maxValue}
              offsetX={offsets.get(point.id) ?? 0}
              date={item.date}
              onPointEnter={onPointEnter}
              onPointLeave={onPointLeave}
            />
          ))}
        </div>
      </div>

      {showLabels && label ? (
        <span
          className={cn(
            "mt-1.5 shrink-0 text-center text-[9px] font-medium sm:text-[10px]",
            glassText.muted,
          )}
        >
          {label}
        </span>
      ) : (
        <span className="mt-1.5 shrink-0 h-[14px]" aria-hidden />
      )}
    </div>
  );
}

type YAxisProps = {
  maxValue: number;
};

function YAxis({ maxValue }: YAxisProps) {
  return (
    <div className={cn("relative h-full w-10 shrink-0 self-stretch pr-1", CHART_PLOT_BOTTOM_CLASS)}>
      {Array.from({ length: Y_TICK_COUNT }, (_, index) => {
        const ratio = index / (Y_TICK_COUNT - 1);
        const value = maxValue * ratio;

        return (
          <span
            key={index}
            className={cn(
              "absolute right-0 -translate-y-1/2 text-right text-[9px] leading-none sm:text-[10px]",
              glassText.muted,
            )}
            style={{ bottom: `${ratio * 100}%` }}
          >
            {formatAxisValue(value)}
          </span>
        );
      })}
    </div>
  );
}

type ChartGridProps = {
  className?: string;
};

function ChartGrid({ className }: ChartGridProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {Array.from({ length: Y_TICK_COUNT }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className="absolute inset-x-0 border-t border-dashed border-white/10"
          style={{ bottom: `${(index / (Y_TICK_COUNT - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}

type LegendRadioProps = {
  color: FinancialChartColor;
};

function LegendRadio({ color }: LegendRadioProps) {
  return (
    <span
      className="relative flex size-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px]"
      style={{ borderColor: COLOR_MAP[color] }}
    >
      <span className="block size-1.5 rounded-full bg-white/50" />
    </span>
  );
}

export function FinancialOverviewChart({
  data,
  period = "weekly",
  range,
  showLabels = true,
  isLoading = false,
  onMenuClick,
  className,
}: FinancialOverviewChartProps) {
  const plotAreaRef = useRef<HTMLDivElement>(null);
  const chartPlotRef = useRef<HTMLDivElement>(null);
  const [plotHeight, setPlotHeight] = useState(160);
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  const expectedCount = getExpectedColumnCount(period, range);
  const chartData =
    data.length === expectedCount ? data : fillMissingPeriods(data, period, range);

  const dataPeak = getDataPeak(chartData);
  const scaleMax = getScaleMax(dataPeak);
  const finalBalance = sumBalance(chartData);
  const isScrollable = period === "monthly" || period === "yearly";
  const { ref: scrollRef, handleMouseDown } = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    const element = plotAreaRef.current;
    if (!element) return;

    const updateHeight = () => setPlotHeight(Math.max(element.clientHeight, 1));

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [chartData.length, period]);

  function handlePointEnter(point: PlotPoint, element: HTMLElement, date: string) {
    const chartElement = chartPlotRef.current;
    if (!chartElement) return;

    const pointRect = element.getBoundingClientRect();
    const chartRect = chartElement.getBoundingClientRect();
    const anchorX = pointRect.left + pointRect.width / 2 - chartRect.left;
    const anchorY = pointRect.top + pointRect.height / 2 - chartRect.top;
    const placement = anchorY <= 64 ? "bottom" : "top";

    setHoveredPoint({
      kind: point.kind,
      value: point.value,
      date,
      anchorX,
      anchorY,
      placement,
    });
  }

  function handlePointLeave() {
    setHoveredPoint(null);
  }

  return (
    <GlassPanel
      {...CHART_GLASS}
      className={cn(
        "h-full w-full min-w-0 overflow-hidden rounded-[20px]",
        isLoading && "pointer-events-none opacity-70",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-6 sm:gap-7 sm:px-8 sm:py-7">
        <div className="flex items-center justify-between">
          <h2
            className={cn(
              glassTextStyles.tableHeader,
              "text-[14px] font-bold tracking-[0.14em] sm:text-[15px]",
            )}
          >
            FLUXO DE CAIXA
          </h2>
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Fluxo de caixa menu"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-glass-secondary",
              glassText.tertiary,
            )}
          >
            <span className="text-[18px] leading-none tracking-[0.12em]">⋯</span>
          </button>
        </div>

        <div
          ref={chartPlotRef}
          className="relative flex min-h-48 min-w-0 flex-1 flex-col overflow-hidden"
          onMouseLeave={handlePointLeave}
        >
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <YAxis maxValue={scaleMax} />

            <div
              ref={plotAreaRef}
              className={cn("relative min-h-0 min-w-0 flex-1 overflow-hidden", CHART_PLOT_BOTTOM_CLASS)}
            >
              <div className="pointer-events-none absolute inset-0">
                <ChartGrid />
              </div>

              <div
                ref={isScrollable ? scrollRef : undefined}
                onMouseDown={isScrollable ? handleMouseDown : undefined}
                className={cn(
                  "absolute inset-0 overflow-x-auto overflow-y-hidden scrollbar-thin",
                  isScrollable &&
                    "cursor-grab snap-x snap-mandatory scroll-smooth select-none active:cursor-grabbing",
                )}
              >
                <div
                  className={cn(
                    "flex h-full min-h-full items-stretch",
                    period === "daily" && "justify-center",
                    period === "weekly" && "min-w-[280px] justify-between gap-1 sm:min-w-0 sm:gap-2",
                    isScrollable && "w-max",
                    period === "monthly" && "gap-0.5 px-0.5",
                    period === "yearly" && "gap-2 px-0.5",
                  )}
                >
                  {chartData.map((item, index) => (
                    <ChartColumn
                      key={item.date || index}
                      columnKey={item.date || String(index)}
                      item={item}
                      maxValue={scaleMax}
                      plotHeight={plotHeight}
                      label={getAxisLabel(item.date, period)}
                      period={period}
                      showLabels={showLabels}
                      onPointEnter={handlePointEnter}
                      onPointLeave={handlePointLeave}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {hoveredPoint ? (
            <div
              className="pointer-events-none absolute z-50"
              style={{
                left: hoveredPoint.anchorX,
                top: hoveredPoint.anchorY,
                transform:
                  hoveredPoint.placement === "top"
                    ? "translate(-50%, calc(-100% - 8px))"
                    : "translate(-50%, 8px)",
              }}
            >
              <PointTooltip
                kind={hoveredPoint.kind}
                value={hoveredPoint.value}
                date={hoveredPoint.date}
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <LegendRadio color={item.color} />
                <span
                  className={cn(
                    "text-[13px] font-medium tracking-[-0.01em]",
                    glassText.secondary,
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

export type { FinancialOverviewPeriod };
