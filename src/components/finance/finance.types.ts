export type FinancialBalance = {
  receitas: number;
  despesas: number;
  saldo: number;
};

export type FinanceSummary = {
  today: FinancialBalance;
  month: FinancialBalance;
  year: FinancialBalance;
  /** Totais acumulados de todas as transações registradas. */
  total: FinancialBalance;
};

export type FinancePeriod = "today" | "thisWeek" | "thisMonth" | "thisYear";

export type FinancialOverviewPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type FinanceFilter =
  | { kind: "period"; period: FinancePeriod }
  | { kind: "range"; start: string; end: string };

export type DailyMovement = {
  date: string;
  receitas: number;
  despesas: number;
};

export type CategoryExpense = {
  id: string;
  name: string;
  color: string;
  total: number;
};
