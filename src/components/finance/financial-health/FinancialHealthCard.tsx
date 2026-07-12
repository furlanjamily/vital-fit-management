import { Info, MoreVertical } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { HealthBarsChart } from "./HealthBarsChart";
import { MOCK_FINANCIAL_HEALTH } from "./mock-data";
import type { FinancialHealthData } from "./types";

const HEALTH_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

export type FinancialHealthCardProps = {
  data?: FinancialHealthData;
  onMenuClick?: () => void;
  className?: string;
};

function splitAmount(amount: number): { whole: string; fraction: string } {
  const [whole, fraction = "00"] = amount.toFixed(2).split(".");
  return {
    whole: Number(whole).toLocaleString("pt-BR"),
    fraction,
  };
}

export function FinancialHealthCard({
  data = MOCK_FINANCIAL_HEALTH,
  onMenuClick,
  className,
}: FinancialHealthCardProps) {
  const { whole, fraction } = splitAmount(data.amount);
  const isNegative = data.changePercent < 0;

  return (
    <GlassPanel
      {...HEALTH_GLASS}
      className={cn("w-full rounded-[20px]", className)}
    >
      <div className="flex flex-col gap-3 px-4 py-4 sm:gap-3.5 sm:px-5 sm:py-5">
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex flex-col gap-1.5">
            <h2 className={cn(glassTextStyles.panelTitle, "truncate text-[14px] tracking-[-0.03em] sm:text-[15px]")}>
              {data.title}
            </h2>
            <span className="inline-flex w-fit items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium tracking-[-0.01em] text-orange-300">
              {data.statusLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Menu de saúde financeira"
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition hover:bg-white/5 hover:text-glass-secondary",
              glassText.muted,
            )}
          >
            <MoreVertical className="size-3.5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex flex-col gap-1">
          <p className="flex min-w-0 items-start leading-none">
            <span className={cn("mr-0.5 mt-1 text-[11px] font-semibold tracking-[-0.04em] sm:text-[12px]", glassText.tertiary)}>
              {data.currencySymbol}
            </span>
            <span className={cn("truncate text-[28px] font-bold tracking-[-0.05em] sm:text-[32px]", glassText.primary)}>
              {whole}
            </span>
            <span className={cn("ml-0.5 mt-1 text-[12px] font-semibold tracking-[-0.03em] sm:text-[13px]", glassText.secondary)}>
              ,{fraction}
            </span>
          </p>

          <p className="text-[11px] tracking-[-0.01em] sm:text-[12px]">
            <span
              className={cn(
                "font-medium",
                isNegative ? "text-red-400" : "text-[#6EE7B7]",
              )}
            >
              {data.changePercent > 0
                ? `+${data.changePercent}%`
                : `${data.changePercent}%`}
            </span>{" "}
            <span className={glassText.muted}>{data.changePeriodLabel}</span>
          </p>
        </div>

        <HealthBarsChart bars={data.bars} />

        <div className="flex items-start gap-2 rounded-xl bg-white/[0.04] px-2.5 py-2 sm:px-3">
          <Info
            className={cn("mt-px size-3 shrink-0", glassText.muted)}
            strokeWidth={1.75}
          />
          <p className={cn("text-[10px] leading-snug tracking-[-0.01em] sm:text-[11px]", glassText.muted)}>
            {data.footerNote}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
