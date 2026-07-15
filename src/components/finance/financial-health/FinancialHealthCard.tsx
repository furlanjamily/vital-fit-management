import { Info, MoreVertical } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { HealthBarsChart } from "./HealthBarsChart";
import type { FinancialChartBar, FinancialHealthData } from "./types";

const HEALTH_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

export type FinancialHealthCardProps = {
  data: FinancialHealthData;
  bars: FinancialChartBar[];
  wideBarSpacing?: boolean;
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
  data,
  bars,
  wideBarSpacing = false,
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
        <header className="w-full flex items-center justify-center gap-2">
          <div className="flex flex-col gap-1.5">
            <h2 className={cn(glassTextStyles.panelTitle, "truncate text-[14px] tracking-[-0.03em] sm:text-[15px]")}>
              {data.title}
            </h2>
            <span className="inline-flex w-full items-center justify-center rounded-full bg-orange-600/60 px-2 py-0.5 text-[10px] font-medium tracking-[-0.01em] text-orange-300">
              {data.statusLabel}
            </span>
          </div>
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
            {!data.hideChange ? (
              <>
                <span
                  className={cn(
                    "font-medium",
                    isNegative ? "text-red-400" : "text-emerald-400",
                  )}
                >
                  {data.changePercent > 0
                    ? `+${data.changePercent}%`
                    : `${data.changePercent}%`}
                </span>{" "}
              </>
            ) : null}
            <span className={glassText.muted}>{data.changePeriodLabel}</span>
          </p>
        </div>

        <HealthBarsChart bars={bars} wideColumns={wideBarSpacing} />

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
