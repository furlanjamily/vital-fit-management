import { Bell, Mail } from "lucide-react";
import { IconButton } from "@/components/common/form";
import { BusinessHeader } from "@/components/dashboard/BusinessHeader";
import { FavouritedWorkout } from "@/components/dashboard/FavouritedWorkout";
import { GymCapacity } from "@/components/dashboard/GymCapacity";
import { HeaderDateWeather } from "@/components/dashboard/HeaderDateWeather";
import { MembersTable } from "@/components/dashboard/MembersTable";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RevenueAnalytics } from "@/components/dashboard/RevenueAnalytics";
import { MemberActivityExact } from "@/components/dashboard/MemberActivityExact";
import { RevenueOverviewExact } from "@/components/dashboard/RevenueOverviewExact";
import { StatsOverviewExact } from "@/components/dashboard/StatsOverviewExact";
import { WorkoutScheduleExact } from "@/components/dashboard/WorkoutScheduleExact";
import { TrainerCards } from "@/components/dashboard/TrainerCards";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const DEFAULT_USER_NAME = "User";

const quickActions = [
  { icon: Bell, label: "Notificações" },
  { icon: Mail, label: "Mensagens" },
] as const;

type DashboardContentProps = {
  userName?: string | null;
};

export function DashboardContent({ userName }: DashboardContentProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={glassTextStyles.pageTitle}>
            Bem vindo de volta, {userName ?? DEFAULT_USER_NAME}!
          </h1>
          <HeaderDateWeather />
        </div>
        <div className={cn("flex items-center gap-2", glassText.secondary)}>
          {quickActions.map((action) => (
            <IconButton
              key={action.label}
              aria-label={action.label}
              className="size-9 bg-white/7 hover:bg-white/13 hover:text-glass-primary"
            >
              <action.icon className="size-4" />
            </IconButton>
          ))}
        </div>
      </div>

      <RevenueOverviewExact />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatsOverviewExact />
        <MemberActivityExact />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <WorkoutScheduleExact />
        </div>
        <div className="lg:col-span-3">
          <GymCapacity />
        </div>
      </div>

      <FavouritedWorkout />

    </div>
  );
}
