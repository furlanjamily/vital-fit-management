import { getFinanceDashboardAction } from "@/app/(app)/finance/actions";
import { FinanceContentClient } from "@/components/finance/FinanceContentClient";

export async function FinanceContent() {
  const dashboard = await getFinanceDashboardAction({ kind: "period", period: "thisMonth" });

  const loadError = !dashboard.summary.success
    ? dashboard.summary.error
    : !dashboard.movements.success
      ? dashboard.movements.error
      : !dashboard.expenses.success
        ? dashboard.expenses.error
        : !dashboard.transactions.success
          ? dashboard.transactions.error
          : null;

  const initialData = {
    summary: dashboard.summary.success
      ? dashboard.summary.data
      : {
          today: { receitas: 0, despesas: 0, saldo: 0 },
          month: { receitas: 0, despesas: 0, saldo: 0 },
          year: { receitas: 0, despesas: 0, saldo: 0 },
          total: { receitas: 0, despesas: 0, saldo: 0 },
        },
    movements: dashboard.movements.success ? dashboard.movements.data : [],
    expenses: dashboard.expenses.success ? dashboard.expenses.data : [],
    transactions: dashboard.transactions.success ? dashboard.transactions.data : [],
  };

  return (
    <FinanceContentClient
      key={`${initialData.summary.month.saldo}-${initialData.movements.length}-${initialData.transactions.length}`}
      initialData={initialData}
      loadError={loadError}
    />
  );
}
