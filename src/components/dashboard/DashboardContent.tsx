import { Bell, Mail } from "lucide-react";
import { IconButton } from "@/components/common/form";
import { BusinessHeader } from "@/components/dashboard/BusinessHeader";
import { FavouritedWorkout } from "@/components/dashboard/FavouritedWorkout";
import { GymCapacity } from "@/components/dashboard/GymCapacity";
import { HeaderDateWeather } from "@/components/dashboard/HeaderDateWeather";
import { MembersTable } from "@/components/dashboard/MembersTable";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RevenueAnalytics } from "@/components/dashboard/RevenueAnalytics";
import { TrainerCards } from "@/components/dashboard/TrainerCards";

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
          <h1 className="text-[1.72rem] font-semibold tracking-[-0.055em] text-white">
            Bem vindo de volta, {userName ?? DEFAULT_USER_NAME}!
          </h1>
          <HeaderDateWeather />
        </div>
        <div className="flex items-center gap-2 text-white/72">
          {quickActions.map((action) => (
            <IconButton
              key={action.label}
              aria-label={action.label}
              className="size-9 bg-white/7 text-white/72 hover:bg-white/13 hover:text-white"
            >
              <action.icon className="size-4" />
            </IconButton>
          ))}
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <BusinessHeader />
          <GymCapacity />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-9">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <MetricCards />
            <RevenueAnalytics />
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-1">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-white">Personal Trainer</h3>
              <div className="grid grid-cols-2 gap-4">
                <TrainerCards />
              </div>
            </div>
            <FavouritedWorkout />
          </div>
        </div>
      </div>

      <div className="w-full grid-cols-1 gap-6">
        <MembersTable />
      </div>
    </div>
  );
}
