"use client";

import { useEffect, useMemo, useState } from "react";
import type { FinancialData } from "@/components/finance/FinancialOverviewChart";
import {
  buildFinancialOverviewData,
  getPeriodDateRange,
  groupMovementsByDate,
  resolveFinanceFilterDates,
  toIsoDate,
} from "@/components/finance/finance.helpers";
import type { FinanceFilter } from "@/components/finance/finance.types";
import { createClient } from "@/lib/supabase/client";

export type DashboardDateRange = FinanceFilter;

export type DashboardPeriod = "today" | "thisWeek" | "thisMonth" | "thisYear";

export const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Hoje",
  thisWeek: "Esta semana",
  thisMonth: "Este mês",
  thisYear: "Este ano",
};

export const DASHBOARD_PERIOD_OPTIONS: DashboardPeriod[] = [
  "today",
  "thisWeek",
  "thisMonth",
  "thisYear",
];

export function periodToDateRange(period: DashboardPeriod): DashboardDateRange {
  return { kind: "period", period };
}

type FinancialMovementRow = {
  transaction_date: string;
  type: string;
  amount: number | string;
};

type GymFlowRow = {
  hour: string;
  count: number | string;
  is_peak: boolean;
};

type StatsRawCounts = {
  newMembers: number;
  previousNewMembers: number;
  visitsToday: number;
  previousVisitsToday: number;
  visitorsInRange: number;
  previousVisitorsInRange: number;
  bookingsInRange: number;
  previousBookingsInRange: number;
};

export type StatsCardViewData = {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: "users" | "clipboard";
};

export type StatsOverviewViewData = {
  cards: StatsCardViewData[];
};

export type GymCapacityDot = {
  key: string;
  isActive: boolean;
};

export type GymCapacityViewData = {
  dots: GymCapacityDot[];
  occupancyPercent: number;
  used: number;
  total: number;
};

export type MemberActivityBubble = {
  id: string;
  percentage: number;
  color: string;
  textColor: string;
  size: number;
  zIndex: number;
  position: {
    left: string;
    top: string;
    transform?: string;
  };
};

export type MemberActivityLegendItem = {
  id: string;
  label: string;
  color: string;
};

export type MemberActivityViewData = {
  bubbles: MemberActivityBubble[];
  legend: MemberActivityLegendItem[];
};

const GYM_CAPACITY_ROWS = 10;
const GYM_CAPACITY_COLS = 14;
const GYM_OPEN_HOUR = 6;
const OCCUPANCY_WINDOW_HOURS = 2;

const ACTIVITY_WINDOWS = [
  { id: "morning", label: "06:00-10:00", color: "#FF7A4A", startHour: 6, endHour: 10 },
  { id: "midday-a", label: "10:00-14:00", color: "#FFB300", startHour: 10, endHour: 14 },
  { id: "midday-b", label: "14:00-18:00", color: "#FF9800", startHour: 14, endHour: 18 },
  { id: "evening", label: "18:00-22:00", color: "#FF7A00", startHour: 18, endHour: 22 },
] as const;

const BUBBLE_LAYOUT = [
  { id: "primary", left: "6%", top: "44%", transform: "translateY(-50%)", zIndex: 10 },
  { id: "amber", left: "34%", top: "0%", zIndex: 20 },
  { id: "green", left: "36%", top: "50%", zIndex: 30 },
  { id: "blue", left: "56%", top: "26%", zIndex: 40 },
] as const;

const BUBBLE_MIN_SIZE = 52;
const BUBBLE_MAX_SIZE = 132;

function formatVariationBadge(current: number, previous: number): string {
  if (previous === 0) {
    return current === 0 ? "0%" : "+100%";
  }

  const variation = ((current - previous) / previous) * 100;
  const rounded = Math.round(variation * 10) / 10;
  return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
}

function getPreviousPeriodRange(range: DashboardDateRange): { start: string; end: string } {
  const { start, end } = resolveFinanceFilterDates(range);
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const daySpan = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
  );

  const previousEnd = new Date(startDate);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (daySpan - 1));

  return { start: toIsoDate(previousStart), end: toIsoDate(previousEnd) };
}

function getYesterdayIso(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toIsoDate(yesterday);
}

function extractHour(isoTimestamp: string): number {
  return new Date(isoTimestamp).getHours();
}

function extractDayKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10);
}

export async function getFinancialMovements(range: DashboardDateRange) {
  const supabase = createClient();
  const { start, end } = resolveFinanceFilterDates(range);

  const { data, error } = await supabase
    .from("vw_financial_transactions")
    .select("transaction_date, type, amount")
    .gte("transaction_date", start)
    .lte("transaction_date", end);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FinancialMovementRow[];
}

export async function getGymFlowData(range: DashboardDateRange) {
  const supabase = createClient();
  const { start, end } = resolveFinanceFilterDates(range);

  const [flowResult, settingsResult, occupancyResult] = await Promise.all([
    supabase
      .from("vw_gym_flow")
      .select("hour, count, is_peak")
      .gte("hour", `${start}T00:00:00.000Z`)
      .lte("hour", `${end}T23:59:59.999Z`),
    supabase.from("gym_settings").select("max_capacity").order("id").limit(1).maybeSingle(),
    supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .gte(
        "checked_at",
        new Date(Date.now() - OCCUPANCY_WINDOW_HOURS * 60 * 60 * 1000).toISOString(),
      ),
  ]);

  if (flowResult.error) {
    throw new Error(flowResult.error.message);
  }

  if (settingsResult.error) {
    throw new Error(settingsResult.error.message);
  }

  if (occupancyResult.error) {
    throw new Error(occupancyResult.error.message);
  }

  const total = Number(settingsResult.data?.max_capacity ?? 100);
  const used = occupancyResult.count ?? 0;
  const available = Math.max(total - used, 0);
  const percent = total > 0 ? Math.round((used / total) * 100) : 0;

  return {
    flow: (flowResult.data ?? []) as GymFlowRow[],
    capacityStatus: { total, used, available, percent },
  };
}

export async function getStatsOverview(range: DashboardDateRange): Promise<StatsRawCounts> {
  const supabase = createClient();
  const { start, end } = resolveFinanceFilterDates(range);
  const previous = getPreviousPeriodRange(range);
  const today = toIsoDate(new Date());
  const yesterday = getYesterdayIso();
  const monthRange = getPeriodDateRange("thisMonth");
  const previousMonthEnd = new Date(`${monthRange.start}T12:00:00`);
  previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);
  const previousMonthStart = new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), 1);
  const previousMonth = {
    start: toIsoDate(previousMonthStart),
    end: toIsoDate(previousMonthEnd),
  };

  const [
    newMembers,
    previousNewMembers,
    visitsToday,
    previousVisitsToday,
    visitorsInRange,
    previousVisitorsInRange,
    bookingsInRange,
    previousBookingsInRange,
  ] = await Promise.all([
    countMembersCreatedBetween(supabase, start, end),
    countMembersCreatedBetween(supabase, previous.start, previous.end),
    countCheckInsBetween(supabase, `${today}T00:00:00.000Z`, `${today}T23:59:59.999Z`),
    countCheckInsBetween(supabase, `${yesterday}T00:00:00.000Z`, `${yesterday}T23:59:59.999Z`),
    countCheckInsBetween(supabase, `${start}T00:00:00.000Z`, `${end}T23:59:59.999Z`),
    countCheckInsBetween(supabase, `${previous.start}T00:00:00.000Z`, `${previous.end}T23:59:59.999Z`),
    countDistinctMembersBetween(supabase, `${start}T00:00:00.000Z`, `${end}T23:59:59.999Z`),
    countDistinctMembersBetween(
      supabase,
      `${previousMonth.start}T00:00:00.000Z`,
      `${previousMonth.end}T23:59:59.999Z`,
    ),
  ]);

  return {
    newMembers,
    previousNewMembers,
    visitsToday,
    previousVisitsToday,
    visitorsInRange,
    previousVisitorsInRange,
    bookingsInRange,
    previousBookingsInRange,
  };
}

async function countMembersCreatedBetween(
  supabase: ReturnType<typeof createClient>,
  start: string,
  end: string,
) {
  const { count, error } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${start}T00:00:00.000Z`)
    .lte("created_at", `${end}T23:59:59.999Z`);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countCheckInsBetween(
  supabase: ReturnType<typeof createClient>,
  startIso: string,
  endIso: string,
) {
  const { count, error } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true })
    .gte("checked_at", startIso)
    .lte("checked_at", endIso);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function countDistinctMembersBetween(
  supabase: ReturnType<typeof createClient>,
  startIso: string,
  endIso: string,
) {
  const { data, error } = await supabase
    .from("check_ins")
    .select("member_id")
    .gte("checked_at", startIso)
    .lte("checked_at", endIso);

  if (error) throw new Error(error.message);

  return new Set((data ?? []).map((row) => row.member_id)).size;
}

export function adaptFinancialMovements(
  rows: FinancialMovementRow[],
  range: DashboardDateRange,
): FinancialData[] {
  const movements = groupMovementsByDate(rows);
  return buildFinancialOverviewData(movements, range);
}

export function adaptPeakHoursTrend(flow: GymFlowRow[]): number[] {
  const hours = new Array<number>(24).fill(0);

  for (const row of flow) {
    const hour = extractHour(row.hour);
    hours[hour] = (hours[hour] ?? 0) + Number(row.count);
  }

  return hours;
}

export function adaptGymCapacityData(
  flow: GymFlowRow[],
  capacityStatus: { total: number; used: number; available: number; percent: number },
): GymCapacityViewData {
  const cellCounts = new Map<string, number>();
  const days = [...new Set(flow.map((row) => extractDayKey(row.hour)))].sort().slice(-GYM_CAPACITY_ROWS);

  for (const row of flow) {
    const dayKey = extractDayKey(row.hour);
    const rowIndex = days.indexOf(dayKey);
    if (rowIndex < 0) continue;

    const hour = extractHour(row.hour);
    const colIndex = hour - GYM_OPEN_HOUR;
    if (colIndex < 0 || colIndex >= GYM_CAPACITY_COLS) continue;

    const key = `${rowIndex}-${colIndex}`;
    cellCounts.set(key, (cellCounts.get(key) ?? 0) + Number(row.count));
  }

  const counts = [...cellCounts.values()];
  const threshold =
    counts.length > 0
      ? Math.max(1, Math.floor(counts.reduce((sum, value) => sum + value, 0) / counts.length))
      : 0;

  const dots: GymCapacityDot[] = [];

  for (let row = 0; row < GYM_CAPACITY_ROWS; row += 1) {
    for (let col = 0; col < GYM_CAPACITY_COLS; col += 1) {
      const key = `${row}-${col}`;
      const count = cellCounts.get(key) ?? 0;
      dots.push({ key, isActive: count > threshold });
    }
  }

  return {
    dots,
    occupancyPercent: capacityStatus.percent,
    used: capacityStatus.used,
    total: capacityStatus.total,
  };
}

function scaleBubbleSize(value: number, maxValue: number): number {
  if (maxValue <= 0) return BUBBLE_MIN_SIZE;
  const ratio = value / maxValue;
  return Math.round(BUBBLE_MIN_SIZE + ratio * (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE));
}

export function adaptMemberActivityData(flow: GymFlowRow[]): MemberActivityViewData {
  const totalCheckIns = flow.reduce((sum, row) => sum + Number(row.count), 0);

  const windowCounts = ACTIVITY_WINDOWS.map((window) => {
    const count = flow.reduce((sum, row) => {
      const hour = extractHour(row.hour);
      if (hour >= window.startHour && hour < window.endHour) {
        return sum + Number(row.count);
      }
      return sum;
    }, 0);

    const percentage =
      totalCheckIns > 0 ? Math.round((count / totalCheckIns) * 100) : 0;

    return { ...window, count, percentage };
  });

  const maxPercentage = Math.max(...windowCounts.map((item) => item.percentage), 1);

  // Posições do cluster seguem o tamanho (maior → âncora esquerda), não a ordem do horário.
  const layoutByWindowId = new Map<string, (typeof BUBBLE_LAYOUT)[number]>();
  [...windowCounts]
    .sort((a, b) => b.percentage - a.percentage)
    .forEach((window, rank) => {
      layoutByWindowId.set(
        window.id,
        BUBBLE_LAYOUT[rank] ?? BUBBLE_LAYOUT[BUBBLE_LAYOUT.length - 1],
      );
    });

  const bubbles: MemberActivityBubble[] = windowCounts.map((window) => {
    const layout = layoutByWindowId.get(window.id)!;

    return {
      id: window.id,
      percentage: window.percentage,
      color: window.color,
      textColor: "#FFFFFF",
      size: scaleBubbleSize(window.percentage, maxPercentage),
      zIndex: layout.zIndex,
      position: {
        left: layout.left,
        top: layout.top,
        transform: "transform" in layout ? layout.transform : undefined,
      },
    };
  });

  const legend: MemberActivityLegendItem[] = windowCounts.map((window) => ({
    id: window.id,
    label: window.label,
    color: window.color,
  }));

  return { bubbles, legend };
}

export function adaptStatsOverview(
  counts: StatsRawCounts,
  range: DashboardDateRange,
): StatsOverviewViewData {
  const { start, end } = resolveFinanceFilterDates(range);
  const periodLabel =
    range.kind === "period" ? DASHBOARD_PERIOD_LABELS[range.period] : `${start} – ${end}`;

  return {
    cards: [
      {
        id: "new-members",
        title: "Novos Alunos",
        description: `Matrículas no período (${periodLabel})`,
        badge: formatVariationBadge(counts.newMembers, counts.previousNewMembers),
        icon: "users",
      },
      {
        id: "visits-today",
        title: "Visitas Hoje",
        description: "Check-ins de hoje vs. ontem",
        badge: formatVariationBadge(counts.visitsToday, counts.previousVisitsToday),
        icon: "users",
      },
      {
        id: "visitors-this-month",
        title: "Visitas no Período",
        description: `Check-ins entre ${start} e ${end}`,
        badge: formatVariationBadge(counts.visitorsInRange, counts.previousVisitorsInRange),
        icon: "users",
      },
      {
        id: "bookings-this-month",
        title: "Alunos Únicos",
        description: "Membros distintos com check-in no período",
        badge: formatVariationBadge(counts.bookingsInRange, counts.previousBookingsInRange),
        icon: "clipboard",
      },
    ],
  };
}

export function useDashboardData(dateRange: DashboardDateRange) {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [gymCapacityData, setGymCapacityData] = useState<GymCapacityViewData | null>(null);
  const [memberActivityData, setMemberActivityData] = useState<MemberActivityViewData | null>(null);
  const [statsOverviewData, setStatsOverviewData] = useState<StatsOverviewViewData | null>(null);
  const [peakHoursTrend, setPeakHoursTrend] = useState<number[]>(() => new Array(24).fill(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [movements, gymData, stats] = await Promise.all([
          getFinancialMovements(dateRange),
          getGymFlowData(dateRange),
          getStatsOverview(dateRange),
        ]);

        if (cancelled) return;

        setFinancialData(adaptFinancialMovements(movements, dateRange));
        setPeakHoursTrend(adaptPeakHoursTrend(gymData.flow));
        setGymCapacityData(adaptGymCapacityData(gymData.flow, gymData.capacityStatus));
        setMemberActivityData(adaptMemberActivityData(gymData.flow));
        setStatsOverviewData(adaptStatsOverview(stats, dateRange));
      } catch (loadError) {
        if (cancelled) return;

        const message =
          loadError instanceof Error ? loadError.message : "Erro ao carregar dados do dashboard.";
        setError(message);
        setFinancialData(adaptFinancialMovements([], dateRange));
        setPeakHoursTrend(new Array(24).fill(0));
        setGymCapacityData(
          adaptGymCapacityData([], { total: 100, used: 0, available: 100, percent: 0 }),
        );
        setMemberActivityData(adaptMemberActivityData([]));
        setStatsOverviewData(
          adaptStatsOverview(
            {
              newMembers: 0,
              previousNewMembers: 0,
              visitsToday: 0,
              previousVisitsToday: 0,
              visitorsInRange: 0,
              previousVisitorsInRange: 0,
              bookingsInRange: 0,
              previousBookingsInRange: 0,
            },
            dateRange,
          ),
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const dateRangeKey = useMemo(() => JSON.stringify(dateRange), [dateRange]);

  return {
    financialData,
    gymCapacityData,
    memberActivityData,
    statsOverviewData,
    peakHoursTrend,
    isLoading,
    error,
    dateRangeKey,
  };
}

/** Fallbacks espelhados para Suspense / carregamento do dashboard operacional */
export { GymCapacityLoading } from "@/components/dashboard/GymCapacity";
export { StatsOverviewExactLoading } from "@/components/dashboard/StatsOverviewExact";
export { MemberActivityExactLoading } from "@/components/dashboard/MemberActivityExact";
