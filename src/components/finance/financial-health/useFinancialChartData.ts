"use client";

import { useMemo } from "react";
import {
  eachDayInRange,
  getAxisLabel,
  getMondayOfWeek,
  getPeriodDateRange,
  resolveFinanceFilterDates,
  toIsoDate,
  WEEKDAY_LABELS,
} from "@/components/finance/finance.helpers";
import type { DailyMovement, FinanceFilter } from "@/components/finance/finance.types";
import type { FinancialChartBar } from "./types";

export type ChartPeriod = "daily" | "weekly" | "monthly";

export type FinancialTransaction = {
  transaction_date: string;
  amount: number;
  type: string;
};

function sumReceitasByDate(transactions: FinancialTransaction[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "RECEITA") continue;

    const date = transaction.transaction_date;
    map.set(date, (map.get(date) ?? 0) + Number(transaction.amount));
  }

  return map;
}

export function buildFinancialChartBars(
  period: ChartPeriod,
  transactions: FinancialTransaction[],
  range?: { start: string; end: string },
): FinancialChartBar[] {
  const receitasByDate = sumReceitasByDate(transactions);
  const now = new Date();

  if (period === "daily") {
    const targetDate = range?.start ?? toIsoDate(now);
    return [{ label: "Hoje", value: receitasByDate.get(targetDate) ?? 0 }];
  }

  if (period === "weekly") {
    const anchor = range?.start ? new Date(`${range.start}T12:00:00`) : now;
    const monday = getMondayOfWeek(anchor);

    return WEEKDAY_LABELS.map((label, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const iso = toIsoDate(day);
      return { label, value: receitasByDate.get(iso) ?? 0 };
    });
  }

  const { start, end } = range ?? getPeriodDateRange("thisMonth");

  return eachDayInRange(start, end).map((date) => ({
    label: getAxisLabel(date, "monthly") ?? date,
    value: receitasByDate.get(date) ?? 0,
  }));
}

function buildRangeChartBars(
  start: string,
  end: string,
  transactions: FinancialTransaction[],
): FinancialChartBar[] {
  const receitasByDate = sumReceitasByDate(transactions);

  return eachDayInRange(start, end).map((date) => {
    const [, month, day] = date.split("-");
    return {
      label: `${day}/${month}`,
      value: receitasByDate.get(date) ?? 0,
    };
  });
}

export function resolveChartPeriod(filter: FinanceFilter): ChartPeriod | null {
  if (filter.kind !== "period") return null;

  if (filter.period === "today") return "daily";
  if (filter.period === "thisWeek") return "weekly";
  if (filter.period === "thisMonth") return "monthly";

  return null;
}

export function buildChartBarsForFilter(
  filter: FinanceFilter,
  transactions: FinancialTransaction[],
): FinancialChartBar[] {
  const { start, end } = resolveFinanceFilterDates(filter);
  const chartPeriod = resolveChartPeriod(filter);

  if (chartPeriod) {
    return buildFinancialChartBars(chartPeriod, transactions, { start, end });
  }

  if (filter.kind === "period" && filter.period === "thisYear") {
    return buildRangeChartBars(start, end, transactions);
  }

  if (filter.kind === "range") {
    const dayCount = eachDayInRange(filter.start, filter.end).length;
    if (dayCount > 7 && dayCount <= 60) {
      return buildFinancialChartBars("monthly", transactions, { start, end });
    }

    return buildRangeChartBars(filter.start, filter.end, transactions);
  }

  return buildFinancialChartBars("monthly", transactions, { start, end });
}

export function useFinancialChartData(
  period: ChartPeriod,
  transactions: FinancialTransaction[],
  range?: { start: string; end: string },
): FinancialChartBar[] {
  return useMemo(
    () => buildFinancialChartBars(period, transactions, range),
    [period, transactions, range],
  );
}

export function dailyMovementsToTransactions(
  movements: DailyMovement[],
): FinancialTransaction[] {
  const transactions: FinancialTransaction[] = [];

  for (const movement of movements) {
    if (movement.receitas > 0) {
      transactions.push({
        transaction_date: movement.date,
        amount: movement.receitas,
        type: "RECEITA",
      });
    }

    if (movement.despesas > 0) {
      transactions.push({
        transaction_date: movement.date,
        amount: movement.despesas,
        type: "DESPESA",
      });
    }
  }

  return transactions;
}

export function useFinancialHealthChartBars(
  filter: FinanceFilter,
  transactions: FinancialTransaction[],
): FinancialChartBar[] {
  return useMemo(
    () => buildChartBarsForFilter(filter, transactions),
    [filter, transactions],
  );
}
