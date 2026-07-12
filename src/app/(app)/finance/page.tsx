import { ExpenseBreakdownCard } from "@/components/finance/expense-breakdown";
import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FinancialHealthCard } from "@/components/finance/financial-health";
import { PortfolioSummaryCard } from "@/components/finance/PortfolioSummaryCard";
import { ProductChartCard } from "@/components/finance/ProductChartCard";

export default function FinancePage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <FinanceHeader />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="flex w-full min-h-0 flex-col gap-6 lg:w-[70%]">
          <PortfolioSummaryCard />
          <ProductChartCard className="h-full flex-1" />
        </div>

        <div className="flex w-full min-h-0 flex-col gap-6 lg:w-[30%]">
          <FinancialHealthCard />
          <ExpenseBreakdownCard className="min-h-0 flex-1" />
        </div>
      </div>
    </div>
  );
}
