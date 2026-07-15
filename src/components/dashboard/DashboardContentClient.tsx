"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Bell, Mail } from "lucide-react";
import { GlassSelect, IconButton } from "@/components/common/form";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  DashboardFavouritedWorkoutSection,
  DashboardGymCapacitySection,
  DashboardMemberActivitySection,
  DashboardRevenueSection,
  DashboardStatsSection,
  DashboardWorkoutScheduleSection,
} from "@/components/dashboard/DashboardSections";
import { HeaderDateWeather } from "@/components/dashboard/HeaderDateWeather";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import {
  adaptGymCapacityData,
  adaptMemberActivityData,
  adaptStatsOverview,
  DASHBOARD_PERIOD_LABELS,
  DASHBOARD_PERIOD_OPTIONS,
  periodToDateRange,
  useDashboardData,
  type DashboardPeriod,
} from "@/hooks/use-dashboard-data";
import type { RevenueChartFilter } from "@/hooks/useRevenueChartData";
import { cn } from "@/lib/cn";

const DEFAULT_USER_NAME = "User";

// const quickActions = [
//   { icon: Bell, label: "Notificações" },
//   { icon: Mail, label: "Mensagens" },
// ] as const;

const EMPTY_STATS = adaptStatsOverview(
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
  periodToDateRange("thisMonth"),
);

const EMPTY_GYM_CAPACITY = adaptGymCapacityData([], {
  total: 100,
  used: 0,
  available: 100,
  percent: 0,
});

const EMPTY_MEMBER_ACTIVITY = adaptMemberActivityData([]);

type DashboardContentClientProps = {
  userName?: string | null;
};

export function DashboardContentClient({ userName }: DashboardContentClientProps) {
  const [period, setPeriod] = useState<DashboardPeriod>("thisMonth");
  const [revenueFilter, setRevenueFilter] = useState<RevenueChartFilter>("monthly");
  const dateRange = useMemo(() => periodToDateRange(period), [period]);

  const {
    gymCapacityData,
    memberActivityData,
    statsOverviewData,
    isLoading,
    error,
  } = useDashboardData(dateRange);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={glassTextStyles.pageTitle}>
            Bem vindo de volta, {userName ?? DEFAULT_USER_NAME}!
          </h1>
          <HeaderDateWeather />
        </div>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-2.5 py-1.5">
              <GlassSelect
                options={DASHBOARD_PERIOD_OPTIONS.map((option) => ({
                  label: DASHBOARD_PERIOD_LABELS[option],
                  value: option,
                }))}
                value={period}
                onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
                className={cn(
                  "cursor-pointer bg-transparent text-[11px] font-medium outline-none",
                  glassText.primary,
                )}
              >
                {DASHBOARD_PERIOD_OPTIONS.map((option) => (
                  <option key={option} value={option} className="text-black">
                    {DASHBOARD_PERIOD_LABELS[option]}
                  </option>
                ))}
              </GlassSelect>
            </label>

          {/* <div className={cn("flex items-center gap-2", glassText.secondary)}>
            {quickActions.map((action) => (
              <IconButton
                key={action.label}
                aria-label={action.label}
                className="size-9 bg-white/7 hover:bg-white/13 hover:text-glass-primary"
              >
                <action.icon className="size-4" />
              </IconButton>
            ))}
          </div> */}
        </div>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <DashboardRevenueSection
        filter={revenueFilter}
        onFilterChange={setRevenueFilter}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardStatsSection
          data={statsOverviewData ?? EMPTY_STATS}
          isLoading={isLoading}
        />
        <DashboardMemberActivitySection
          data={memberActivityData ?? EMPTY_MEMBER_ACTIVITY}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <DashboardWorkoutScheduleSection />
        </div>
        <div className="lg:col-span-3">
          <DashboardGymCapacitySection
            data={gymCapacityData ?? EMPTY_GYM_CAPACITY}
            isLoading={isLoading}
          />
        </div>
      </div>

      <DashboardFavouritedWorkoutSection />
    </div>
  );
}
