"use client";



import { useEffect, useMemo, useState, useTransition } from "react";

import { getFinanceMovementsAction } from "@/app/(app)/finance/actions";

import {
  buildRevenueChartBars,
  sumRevenueFromMovements,
} from "@/components/finance/finance.helpers";
import type { RevenueChartBar } from "@/components/finance/finance.helpers";
import type { FinanceFilter } from "@/components/finance/finance.types";

export type { RevenueChartBar } from "@/components/finance/finance.helpers";

export type RevenueChartFilter = "daily" | "weekly" | "monthly" | "yearly";



export const REVENUE_CHART_FILTER_LABELS: Record<RevenueChartFilter, string> = {

  daily: "Hoje",

  weekly: "Esta semana",

  monthly: "Este mês",

  yearly: "Este ano",

};



export const REVENUE_CHART_FILTER_OPTIONS: RevenueChartFilter[] = [

  "daily",

  "weekly",

  "monthly",

  "yearly",

];



function filterToFinanceFilter(filter: RevenueChartFilter): FinanceFilter {

  switch (filter) {

    case "daily":

      return { kind: "period", period: "today" };

    case "weekly":

      return { kind: "period", period: "thisWeek" };

    case "monthly":

      return { kind: "period", period: "thisMonth" };

    case "yearly":

      return { kind: "period", period: "thisYear" };

  }

}



export { computeRevenueVariation } from "@/components/finance/finance.helpers";



export function useRevenueChartData(filter: RevenueChartFilter) {

  const [bars, setBars] = useState<RevenueChartBar[]>(() => buildRevenueChartBars(filter, []));

  const [totalRevenue, setTotalRevenue] = useState(0);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();



  useEffect(() => {

    startTransition(async () => {

      setFetchError(null);



      const result = await getFinanceMovementsAction(filterToFinanceFilter(filter));



      if (!result.success) {

        setFetchError(result.error);

        setBars(buildRevenueChartBars(filter, []));

        setTotalRevenue(0);

        return;

      }



      setBars(buildRevenueChartBars(filter, result.data));

      setTotalRevenue(sumRevenueFromMovements(result.data));

    });

  }, [filter]);



  const totalFromBars = useMemo(

    () => bars.reduce((sum, bar) => sum + bar.value, 0),

    [bars],

  );



  return {

    bars,

    totalRevenue: totalRevenue || totalFromBars,

    isLoading: isPending,

    error: fetchError,

  };

}



/** Fallback espelhado para Suspense / carregamento do gráfico de receitas */

export { RevenueOverviewExactSkeleton as RevenueOverviewExactLoading } from "@/components/dashboard/RevenueOverviewExactSkeleton";


