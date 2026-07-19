"use client";

import { useMemo, useState, useTransition } from "react";
import { getFinanceDashboardAction } from "@/app/(app)/finance/actions";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import { Table } from "@/components/common/table/Table";
import { ExpenseBreakdownCard, ExpenseBreakdownCardLoading } from "@/components/finance/expense-breakdown";
import {
  buildFinancialTransactionColumns,
  financialTransactionFilters,
} from "@/components/finance/financial-transactions/financial-transactions.columns";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import { FinanceHeader } from "@/components/finance/FinanceHeader";
import { FinancialHealthCard } from "@/components/finance/financial-health";
import {
  dailyMovementsToTransactions,
  useFinancialHealthChartBars,
} from "@/components/finance/financial-health/useFinancialChartData";
import {
  buildExpenseBreakdownData,
  buildFinancialHealthData,
  buildGeneralPortfolioMetrics,
  buildFinancialOverviewData,
  resolveFinanceFilterDates,
  resolveOverviewChartPeriod,
} from "@/components/finance/finance.helpers";
import type {
  CategoryExpense,
  DailyMovement,
  FinanceFilter,
  FinanceSummary,
  FinancialBalance,
} from "@/components/finance/finance.types";
import { FinancialOverviewChart } from "@/components/finance/FinancialOverviewChart";
import { PortfolioSummaryCard } from "@/components/finance/PortfolioSummaryCard";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { useFinancialTransactions } from "@/hooks/useFinancialTransactions";
import { useToastOnError } from "@/hooks/useToastOnError";
import { cn } from "@/lib/cn";
import { toastError } from "@/lib/toast-utils";

type FinanceDashboardData = {
  summary: FinanceSummary;
  movements: DailyMovement[];
  expenses: CategoryExpense[];
  transactions: FinancialTransaction[];
  balance?: FinancialBalance | null;
};

type FinanceContentClientProps = {
  initialData: FinanceDashboardData;
  loadError?: string | null;
};

export function FinanceContentClient({
  initialData,
  loadError = null,
}: FinanceContentClientProps) {
  const [filter, setFilter] = useState<FinanceFilter>({ kind: "period", period: "thisMonth" });
  const [data, setData] = useState(initialData);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    transactions,
    isPending: isTransactionsPending,
    editingTransaction,
    removingTransaction,
    openEditForm,
    closeEditForm,
    handleEditSuccess,
    requestRemove,
    cancelRemove,
    removeTransaction,
  } = useFinancialTransactions(filter, data.transactions);

  useToastOnError(loadError);

  const computedBalance = data.balance ?? undefined;

  const portfolioMetrics = useMemo(
    () => buildGeneralPortfolioMetrics(data.summary),
    [data.summary],
  );

  const healthData = useMemo(
    () => buildFinancialHealthData(data.summary, filter, computedBalance),
    [data.summary, filter, computedBalance],
  );

  const healthChartTransactions = useMemo(
    () => dailyMovementsToTransactions(data.movements),
    [data.movements],
  );

  const healthChartBars = useFinancialHealthChartBars(filter, healthChartTransactions);

  const expenseData = useMemo(
    () => buildExpenseBreakdownData(data.expenses, filter),
    [data.expenses, filter],
  );

  const chartPeriod = useMemo(() => resolveOverviewChartPeriod(filter), [filter]);

  const chartRange = useMemo(() => {
    const { start, end } = resolveFinanceFilterDates(filter);
    return { start, end };
  }, [filter]);

  const chartData = useMemo(
    () => buildFinancialOverviewData(data.movements, filter),
    [data.movements, filter],
  );

  const transactionColumns = useMemo(
    () =>
      buildFinancialTransactionColumns({
        isPending: isTransactionsPending,
        onEdit: openEditForm,
        onRemove: requestRemove,
      }),
    [isTransactionsPending, openEditForm, requestRemove],
  );

  function refetchDashboard(nextFilter: FinanceFilter = filter) {
    startTransition(async () => {
      const result = await getFinanceDashboardAction(nextFilter);

      if (!result.summary.success) {
        toastError(result.summary.error);
        return;
      }

      if (result.balance && !result.balance.success) {
        toastError(result.balance.error);
        return;
      }

      setData({
        summary: result.summary.data,
        movements: result.movements.success ? result.movements.data : [],
        expenses: result.expenses.success ? result.expenses.data : [],
        transactions: result.transactions.success ? result.transactions.data : [],
        balance: result.balance?.success ? result.balance.data : null,
      });
    });
  }

  function handlePeriodChange(period: "today" | "thisWeek" | "thisMonth") {
    const nextFilter: FinanceFilter = { kind: "period", period };
    setFilter(nextFilter);
    refetchDashboard(nextFilter);
  }

  function handleDateRangeChange(range: { start: string; end: string }) {
    const nextFilter: FinanceFilter = { kind: "range", start: range.start, end: range.end };
    setFilter(nextFilter);
    refetchDashboard(nextFilter);
  }

  function handleTransactionSuccess() {
    setTransactionFormOpen(false);
    refetchDashboard();
  }

  const isBusy = isPending || isTransactionsPending;

  return (
    <div className="flex min-h-full w-full flex-col gap-6 lg:min-h-0">
      <FinanceHeader
        activeFilter={filter}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={handleDateRangeChange}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="flex w-full min-h-0 min-w-0 flex-col gap-6 lg:w-[70%]">
          <PortfolioSummaryCard
            className="shrink-0"
            metrics={portfolioMetrics}
            onNewTransaction={() => setTransactionFormOpen(true)}
          />
          <FinancialOverviewChart
            className="h-full min-h-0 min-w-0 flex-1"
            data={chartData}
            period={chartPeriod}
            range={chartRange}
            showLabels={chartPeriod !== "daily"}
            isLoading={isBusy}
          />
        </div>

        <div className="flex w-full min-h-0 flex-col gap-6 lg:w-[30%]">
          <FinancialHealthCard
            data={healthData}
            bars={healthChartBars}
            wideBarSpacing={filter.kind === "range"}
          />
          {isBusy ? (
            <ExpenseBreakdownCardLoading className="min-h-0 flex-1" />
          ) : (
            <ExpenseBreakdownCard className="min-h-0 flex-1" data={expenseData} />
          )}
        </div>
      </div>

      <Table
        data={transactions}
        columns={transactionColumns}
        getRowId={(transaction) => transaction.id}
        title="Histórico de transações"
        filters={financialTransactionFilters}
        emptyMessage="Nenhuma transação encontrada no período."
        defaultPageSize={10}
        rowClassName={() => "align-middle"}
        className={cn("gap-5", isBusy && "pointer-events-none opacity-70")}
      />

      {transactionFormOpen ? (
        <TransactionForm
          onSuccess={handleTransactionSuccess}
          onCancel={() => setTransactionFormOpen(false)}
        />
      ) : null}

      {editingTransaction ? (
        <TransactionForm
          editingTransaction={editingTransaction}
          onSuccess={handleEditSuccess}
          onCancel={closeEditForm}
        />
      ) : null}

      {removingTransaction ? (
        <ConfirmRemoveDialog
          title="Excluir transação"
          subjectName={removingTransaction.description}
          pending={isTransactionsPending}
          onConfirm={() => removeTransaction(removingTransaction.id)}
          onCancel={cancelRemove}
        />
      ) : null}
    </div>
  );
}
