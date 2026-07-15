"use client";

import { Suspense, lazy } from "react";
import { WorkoutScheduleExactSkeleton } from "@/components/dashboard/WorkoutScheduleExactSkeleton";
import { FavouritedWorkoutSkeleton } from "@/components/dashboard/FavouritedWorkoutSkeleton";
import { FavouritedWorkout } from "@/components/dashboard/FavouritedWorkout";
import { useWorkoutSchedule } from "@/hooks/useWorkoutSchedule";
import { useFavouritedWorkouts } from "@/hooks/useFavouritedWorkouts";
import {
  GymCapacityLoading,
  MemberActivityExactLoading,
  StatsOverviewExactLoading,
  type GymCapacityViewData,
  type MemberActivityViewData,
  type StatsOverviewViewData,
} from "@/hooks/use-dashboard-data";
import { RevenueOverviewExactLoading, type RevenueChartFilter } from "@/hooks/useRevenueChartData";

const RevenueOverviewExactLazy = lazy(() =>
  import("@/components/dashboard/RevenueOverviewExact").then((loaded) => ({
    default: loaded.RevenueOverviewExact,
  })),
);

const StatsOverviewExactLazy = lazy(() =>
  import("@/components/dashboard/StatsOverviewExact").then((loaded) => ({
    default: loaded.StatsOverviewExact,
  })),
);

const MemberActivityExactLazy = lazy(() =>
  import("@/components/dashboard/MemberActivityExact").then((loaded) => ({
    default: loaded.MemberActivityExact,
  })),
);

const GymCapacityLazy = lazy(() =>
  import("@/components/dashboard/GymCapacity").then((loaded) => ({
    default: loaded.GymCapacity,
  })),
);

const WorkoutScheduleExactLazy = lazy(() =>
  import("@/components/dashboard/WorkoutScheduleExact").then((loaded) => ({
    default: loaded.WorkoutScheduleExact,
  })),
);

type DashboardRevenueSectionProps = {
  filter: RevenueChartFilter;
  onFilterChange: (filter: RevenueChartFilter) => void;
};

export function DashboardRevenueSection({ filter, onFilterChange }: DashboardRevenueSectionProps) {
  return (
    <Suspense fallback={<RevenueOverviewExactLoading />}>
      <RevenueOverviewExactLazy filter={filter} onFilterChange={onFilterChange} />
    </Suspense>
  );
}

type DashboardStatsSectionProps = {
  data: StatsOverviewViewData;
  isLoading: boolean;
};

export function DashboardStatsSection({ data, isLoading }: DashboardStatsSectionProps) {
  return (
    <Suspense fallback={<StatsOverviewExactLoading />}>
      <StatsOverviewExactLazy data={data} isLoading={isLoading} />
    </Suspense>
  );
}

type DashboardMemberActivitySectionProps = {
  data: MemberActivityViewData;
  isLoading: boolean;
};

export function DashboardMemberActivitySection({
  data,
  isLoading,
}: DashboardMemberActivitySectionProps) {
  return (
    <Suspense fallback={<MemberActivityExactLoading />}>
      <MemberActivityExactLazy data={data} isLoading={isLoading} />
    </Suspense>
  );
}

type DashboardGymCapacitySectionProps = {
  data: GymCapacityViewData;
  isLoading: boolean;
};

export function DashboardGymCapacitySection({ data, isLoading }: DashboardGymCapacitySectionProps) {
  return (
    <Suspense fallback={<GymCapacityLoading />}>
      <GymCapacityLazy data={data} isLoading={isLoading} />
    </Suspense>
  );
}

export function DashboardWorkoutScheduleSection() {
  const { data, isLoading, error } = useWorkoutSchedule();

  return (
    <Suspense fallback={<WorkoutScheduleExactSkeleton />}>
      <WorkoutScheduleExactLazy data={data} isLoading={isLoading} error={error} />
    </Suspense>
  );
}

export { WorkoutScheduleExactSkeleton as WorkoutScheduleExactLoading } from "@/components/dashboard/WorkoutScheduleExactSkeleton";

export function DashboardFavouritedWorkoutSection() {
  const { data, isLoading, error } = useFavouritedWorkouts();

  if (isLoading) {
    return <FavouritedWorkoutSkeleton />;
  }

  return <FavouritedWorkout data={data} error={error} />;
}

export { FavouritedWorkoutSkeleton as FavouritedWorkoutLoading } from "@/components/dashboard/FavouritedWorkoutSkeleton";
