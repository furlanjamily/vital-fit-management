import type { PortfolioMetric } from "@/components/finance/PortfolioSummaryCard";
import type { ExpenseBreakdownData } from "@/components/finance/expense-breakdown/types";
import type { FinancialHealthData } from "@/components/finance/financial-health/types";
import type { FinancialData } from "@/components/finance/FinancialOverviewChart";
import type {
  CategoryExpense,
  DailyMovement,
  FinanceFilter,
  FinancePeriod,
  FinancialBalance,
  FinancialOverviewPeriod,
  FinanceSummary,
} from "@/components/finance/finance.types";

export function formatBrlAmount(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

export const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const;

export function getMondayOfWeek(date: Date): Date {
  const monday = new Date(date);
  const dayOfWeek = monday.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function eachDayInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);

  while (cursor <= endDate) {
    days.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function emptyFinancialData(date: string): FinancialData {
  return { date, revenue: 0, expense: 0, balance: 0 };
}

function aggregateRange(data: FinancialData[], start: string, end: string): FinancialData {
  return data
    .filter((item) => item.date >= start && item.date <= end)
    .reduce(
      (acc, item) => ({
        date: start,
        revenue: acc.revenue + item.revenue,
        expense: acc.expense + item.expense,
        balance: acc.balance + item.balance,
      }),
      emptyFinancialData(start),
    );
}

function aggregateByMonth(data: FinancialData[], year: number): Map<string, FinancialData> {
  const map = new Map<string, FinancialData>();
  const yearPrefix = String(year);

  for (const item of data) {
    if (!item.date.startsWith(yearPrefix)) continue;

    const monthKey = item.date.slice(0, 7);
    const current = map.get(monthKey) ?? emptyFinancialData(monthKey);

    current.revenue += item.revenue;
    current.expense += item.expense;
    current.balance += item.balance;
    map.set(monthKey, current);
  }

  return map;
}

export function getExpectedColumnCount(
  period: FinancialOverviewPeriod,
  range?: { start: string; end: string },
): number {
  if (period === "daily") return 1;
  if (period === "weekly") return 7;
  if (period === "yearly") return 12;

  const start = range?.start ?? toIsoDate(new Date());
  const end = range?.end ?? start;
  return eachDayInRange(start, end).length;
}

export function resolveOverviewChartPeriod(filter: FinanceFilter): FinancialOverviewPeriod {
  if (filter.kind === "period") {
    if (filter.period === "today") return "daily";
    if (filter.period === "thisWeek") return "weekly";
    if (filter.period === "thisMonth") return "monthly";
    if (filter.period === "thisYear") return "yearly";
    return "monthly";
  }

  const dayCount = eachDayInRange(filter.start, filter.end).length;
  if (dayCount === 1) return "daily";
  if (dayCount > 60) return "yearly";
  if (dayCount <= 7) return "weekly";

  return "monthly";
}

export function fillMissingPeriods(
  data: FinancialData[],
  period: FinancialOverviewPeriod,
  range?: { start: string; end: string },
): FinancialData[] {
  const dataByDate = new Map(data.map((item) => [item.date, item]));
  const start = range?.start ?? toIsoDate(new Date());
  const end = range?.end ?? start;

  if (period === "daily") {
    if (start !== end) {
      return [aggregateRange(data, start, end)];
    }

    return [dataByDate.get(start) ?? emptyFinancialData(start)];
  }

  if (period === "weekly") {
    const monday = getMondayOfWeek(new Date(`${start}T12:00:00`));

    return WEEKDAY_LABELS.map((_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const iso = toIsoDate(day);
      return dataByDate.get(iso) ?? emptyFinancialData(iso);
    });
  }

  if (period === "monthly") {
    return eachDayInRange(start, end).map(
      (iso) => dataByDate.get(iso) ?? emptyFinancialData(iso),
    );
  }

  const year = Number.parseInt(start.slice(0, 4), 10);
  const dataByMonth = aggregateByMonth(data, year);

  return MONTH_INITIALS.map((_, monthIndex) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    return dataByMonth.get(monthKey) ?? emptyFinancialData(monthKey);
  });
}

export function getAxisLabel(date: string, period: FinancialOverviewPeriod): string | null {
  if (period === "daily") return null;

  if (period === "weekly") {
    const dayIndex = new Date(`${date}T12:00:00`).getDay();
    const labelIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return WEEKDAY_LABELS[labelIndex];
  }

  if (period === "monthly") {
    return date.slice(8, 10);
  }

  const monthIndex = Number.parseInt(date.slice(5, 7), 10) - 1;
  return MONTH_INITIALS[monthIndex] ?? null;
}

export function getPeriodDateRange(period: FinancePeriod): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  if (period === "today") {
    const iso = toIsoDate(now);
    return { start: iso, end: iso };
  }

  if (period === "thisWeek") {
    const dayOfWeek = now.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(day - daysFromMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: toIsoDate(monday), end: toIsoDate(sunday) };
  }

  if (period === "thisYear") {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    };
  }

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return { start: monthStart, end: monthEnd };
}

export function resolveFinanceFilterDates(filter: FinanceFilter): {
  start: string;
  end: string;
  period?: FinancePeriod;
} {
  if (filter.kind === "range") {
    return { start: filter.start, end: filter.end };
  }

  const range = getPeriodDateRange(filter.period);
  return { ...range, period: filter.period };
}

export function formatFinanceFilterLabel(filter: FinanceFilter): string {
  if (filter.kind === "period") {
    if (filter.period === "today") return "Hoje";
    if (filter.period === "thisWeek") return "Esta semana";
    if (filter.period === "thisYear") return "Neste ano";
    return "Neste mês";
  }

  const [startYear, startMonth, startDay] = filter.start.split("-");
  const [endYear, endMonth, endDay] = filter.end.split("-");

  if (filter.start === filter.end) {
    return `${startDay}/${startMonth}/${startYear}`;
  }

  return `${startDay}/${startMonth}/${startYear} – ${endDay}/${endMonth}/${endYear}`;
}

function balanceForPeriod(summary: FinanceSummary, period: FinancePeriod): FinancialBalance {
  if (period === "today") return summary.today;
  if (period === "thisYear") return summary.year;
  if (period === "thisMonth") return summary.month;
  return summary.month;
}

export function buildGeneralPortfolioMetrics(summary: FinanceSummary): PortfolioMetric[] {
  const balance = summary.total;

  return [
    {
      title: "Saldo",
      value: formatBrlAmount(balance.saldo),
      variation: balance.saldo >= 0 ? 0 : 0,
      trend: balance.saldo >= 0 ? "up" : "down",
      hideTrend: true,
    },
    {
      title: "Receitas",
      value: formatBrlAmount(balance.receitas),
      variation: 0,
      trend: "up",
      hideTrend: true,
    },
    {
      title: "Despesas",
      value: formatBrlAmount(balance.despesas),
      variation: 0,
      trend: "down",
      hideTrend: true,
    },
  ];
}

function resolveHealthStatus(balance: FinancialBalance): FinancialHealthData["status"] {
  if (balance.saldo < 0) return "off_track";
  if (balance.receitas > 0 && balance.despesas / balance.receitas > 0.85) return "at_risk";
  return "on_track";
}

const HEALTH_STATUS_LABELS: Record<FinancialHealthData["status"], string> = {
  on_track: "No caminho",
  at_risk: "Atenção",
  off_track: "Em déficit",
};

export function buildFinancialHealthData(
  summary: FinanceSummary,
  filter: FinanceFilter,
  computedBalance?: FinancialBalance,
): FinancialHealthData {
  const balance =
    computedBalance ??
    (filter.kind === "period" ? balanceForPeriod(summary, filter.period) : { receitas: 0, despesas: 0, saldo: 0 });
  const status = resolveHealthStatus(balance);
  const periodLabel = formatFinanceFilterLabel(filter);

  return {
    id: `financial-health-${filter.kind === "period" ? filter.period : `${filter.start}-${filter.end}`}`,
    title: "Saúde Financeira",
    status,
    statusLabel: HEALTH_STATUS_LABELS[status],
    amount: balance.saldo,
    currencySymbol: "R$",
    changePercent: 0,
    changePeriodLabel: periodLabel,
    footerNote: "Com base nas receitas registradas no período!",
    hideChange: true,
  };
}

export function sortExpenseCategoriesByName(categories: CategoryExpense[]): CategoryExpense[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Une todas as categorias de despesa com totais do período (0 quando não houver lançamentos). */
export function mergeExpenseCategoriesWithTotals(
  allCategories: Pick<CategoryExpense, "id" | "name" | "color">[],
  transactionTotals: CategoryExpense[],
): CategoryExpense[] {
  const totalsById = new Map(transactionTotals.map((item) => [item.id, item.total]));

  return sortExpenseCategoriesByName(
    allCategories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      total: totalsById.get(category.id) ?? 0,
    })),
  );
}

export function buildExpenseBreakdownData(
  expenses: CategoryExpense[],
  filter: FinanceFilter,
): ExpenseBreakdownData {
  const periodLabel = formatFinanceFilterLabel(filter);

  const items = sortExpenseCategoriesByName(expenses).map((expense) => ({
    id: expense.id,
    name: expense.name,
    value: expense.total,
    color: expense.color,
  }));

  return {
    title: `Despesas por categoria (${periodLabel})`,
    totalLabel: "Total",
    items,
  };
}

export function buildFinancialOverviewData(
  movements: DailyMovement[],
  filter: FinanceFilter,
): FinancialData[] {
  const raw = movements.map((item) => ({
    date: item.date,
    revenue: item.receitas,
    expense: item.despesas,
    balance: item.receitas - item.despesas,
  }));

  const period = resolveOverviewChartPeriod(filter);
  const { start, end } = resolveFinanceFilterDates(filter);

  return fillMissingPeriods(raw, period, { start, end });
}

export function groupExpensesByCategory(
  rows: {
    category_id?: string;
    amount: number | string;
    financial_categories?:
      | { id: string; name: string; color: string }
      | { id: string; name: string; color: string }[]
      | null;
  }[],
): CategoryExpense[] {
  const totals = new Map<string, CategoryExpense>();

  for (const row of rows) {
    const joined = row.financial_categories;
    const category = Array.isArray(joined) ? joined[0] : joined;
    if (!category) continue;

    const current = totals.get(category.id) ?? {
      id: category.id,
      name: category.name,
      color: category.color,
      total: 0,
    };

    current.total += Number(row.amount);
    totals.set(category.id, current);
  }

  return [...totals.values()];
}

export function groupMovementsByDate(
  rows: { transaction_date: string; amount: number | string; type: string }[],
): DailyMovement[] {
  const map = new Map<string, DailyMovement>();

  for (const row of rows) {
    const current = map.get(row.transaction_date) ?? {
      date: row.transaction_date,
      receitas: 0,
      despesas: 0,
    };

    if (row.type === "RECEITA") current.receitas += Number(row.amount);
    if (row.type === "DESPESA") current.despesas += Number(row.amount);

    map.set(row.transaction_date, current);
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}
