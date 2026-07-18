import { Button } from "@/components/common/button/Button";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type PortfolioMetric = {
  title: string;
  value: string;
  variation: number;
  trend: "up" | "down";
  hideTrend?: boolean;
};

type PortfolioSummaryCardProps = {
  metrics?: PortfolioMetric[];
  onNewTransaction?: () => void;
  className?: string;
};

const PORTFOLIO_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const MOCK_METRICS: PortfolioMetric[] = [
  {
    title: "Saldo Atual",
    value: "42.069,00",
    variation: 24,
    trend: "up",
  },
  {
    title: "Lucro Total",
    value: "8.664,00",
    variation: 22,
    trend: "up",
  },
  {
    title: "Perda Total",
    value: "1.212,00",
    variation: -20,
    trend: "down",
  },
];

type MetricTrendProps = {
  variation: number;
  trend: PortfolioMetric["trend"];
};

function MetricTrend({ variation, trend }: MetricTrendProps) {
  const isUp = trend === "up";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium leading-none tracking-[-0.01em]",
        isUp ? "text-emerald-400" : "text-red-400",
      )}
    >
      <span className="text-[9px] leading-none">{isUp ? "▲" : "▼"}</span>
      {variation > 0 ? `+${variation}%` : `${variation}%`}
    </span>
  );
}

type MetricValueProps = {
  value: string;
};

function MetricValue({ value }: MetricValueProps) {
  return (
    <div className="mt-2 flex min-w-0 items-start justify-center gap-1.5 leading-none">
      <span className={cn("mt-0.5 shrink-0 text-[12px] font-semibold tracking-[-0.04em] sm:text-[13px]", glassText.tertiary)}>
        R$
      </span>
      <span
        title={`R$ ${value}`}
        className={cn(
          "min-w-0 truncate text-[18px] font-bold tracking-[-0.04em] sm:text-[20px] lg:text-[22px]",
          glassText.primary,
        )}
      >
        {value}
      </span>
    </div>
  );
}

type PortfolioMetricItemProps = {
  metric: PortfolioMetric;
  aloneOnRow?: boolean;
};

function PortfolioMetricItem({ metric, aloneOnRow = false }: PortfolioMetricItemProps) {
  return (
    <div
      className={cn(
        "min-w-0 text-center md:flex-1 md:basis-0 md:overflow-hidden md:pr-3 md:last:pr-0",
        aloneOnRow &&
          "col-span-2 w-[calc(50%-0.5rem)] justify-self-center md:col-span-1 md:w-auto md:justify-self-auto",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
        <span className={cn("truncate text-[12px] font-medium leading-none tracking-[-0.02em]", glassText.secondary)}>
          {metric.title}
        </span>
        {!metric.hideTrend ? (
          <MetricTrend variation={metric.variation} trend={metric.trend} />
        ) : null}
      </div>
      <MetricValue value={metric.value} />
    </div>
  );
}

export function PortfolioSummaryCard({
  metrics = MOCK_METRICS,
  onNewTransaction,
  className,
}: PortfolioSummaryCardProps) {
  return (
    <GlassPanel
      {...PORTFOLIO_GLASS}
      className={cn("w-full shrink-0 rounded-[20px]", className)}
    >
      <div className="flex max-h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h2 className={cn(glassText.primary, "text-[20px] font-bold leading-tight tracking-[-0.04em] sm:text-[22px]")}>
            Resumo Geral
          </h2>

          <Button type="button" variant="primary" size="sm" onClick={onNewTransaction}>
            Nova Transação +
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 place-items-center gap-x-4 gap-y-6 sm:mt-9 md:flex md:flex-row md:place-items-stretch md:gap-5 lg:gap-8">
          {metrics.map((metric, index) => (
            <PortfolioMetricItem
              key={metric.title}
              metric={metric}
              aloneOnRow={metrics.length % 2 === 1 && index === metrics.length - 1}
            />
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
