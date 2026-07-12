import { cn } from "@/lib/cn";
import type { FinancialHealthBar, HealthBarColor } from "./types";

type HealthBarsChartProps = {
  bars: FinancialHealthBar[];
  className?: string;
};

const BAR_COLORS: Record<HealthBarColor, string> = {
  lavender: "#FFB300",
  mint: "#FF7A4A",
};

export function HealthBarsChart({ bars, className }: HealthBarsChartProps) {
  return (
    <div
      className={cn(
        "flex h-14 w-full items-center gap-[2px] sm:h-16 sm:gap-0.5",
        className,
      )}
      role="img"
      aria-label="Gráfico de saúde financeira"
    >
      {bars.map((bar, index) => (
        <span
          key={`${bar.color}-${index}`}
          className="min-w-0 flex-1 rounded-full"
          style={{
            height: `${Math.max(18, bar.height)}%`,
            backgroundColor: BAR_COLORS[bar.color],
          }}
        />
      ))}
    </div>
  );
}
