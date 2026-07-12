import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { ExpenseBreakdownDoughnut } from "./ExpenseBreakdownDoughnut";
import { ExpenseBreakdownLegend } from "./ExpenseBreakdownLegend";
import { MOCK_EXPENSE_BREAKDOWN } from "./mock-data";
import type { ExpenseBreakdownData } from "./types";

const EXPENSE_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

export type ExpenseBreakdownCardProps = {
  data?: ExpenseBreakdownData;
  className?: string;
};

export function ExpenseBreakdownCard({
  data = MOCK_EXPENSE_BREAKDOWN,
  className,
}: ExpenseBreakdownCardProps) {
  return (
    <GlassPanel
      {...EXPENSE_GLASS}
      className={cn(
        "flex w-full flex-col rounded-[20px] sm:rounded-[22px] md:rounded-[24px]",
        className,
      )}
    >
      <div className="flex h-full min-h-[300px] flex-col p-4 sm:min-h-[320px] sm:p-5 md:p-6 lg:min-h-0">
        <h2 className={cn(glassText.primary, "shrink-0 text-center text-[16px] font-semibold tracking-normal sm:text-left sm:text-[17px] md:text-[18px]")}>
          {data.title}
        </h2>

        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-5 sm:mt-3 sm:gap-6">
          <ExpenseBreakdownDoughnut
            items={data.items}
            totalLabel={data.totalLabel}
            className="w-[130px] sm:w-[145px] md:w-[160px] lg:w-[130px] xl:w-[150px] 2xl:w-[170px]"
          />

          <ExpenseBreakdownLegend items={data.items} className="max-w-full px-1" />
        </div>
      </div>
    </GlassPanel>
  );
}
