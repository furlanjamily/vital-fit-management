import { Bell, Mail } from "lucide-react";
import { BusinessHeader } from "@/components/dashboard/BusinessHeader";
import { FavouritedWorkout } from "@/components/dashboard/FavouritedWorkout";
import { GymCapacity } from "@/components/dashboard/GymCapacity";
import { HeaderDateWeather } from "@/components/dashboard/HeaderDateWeather";
import { MembersTable } from "@/components/dashboard/MembersTable";
import { MetricCards } from "@/components/dashboard/MetricCards";
// import { MobileAppPromo } from "@/components/dashboard/MobileAppPromo";
import { RevenueAnalytics } from "@/components/dashboard/RevenueAnalytics";
import { TrainerCards } from "@/components/dashboard/TrainerCards";

type DashboardContentProps = {
  userName?: string | null;
};

export function DashboardContent({ userName }: DashboardContentProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.72rem] font-semibold tracking-[-0.055em] text-white">
            Bem vindo de volta, {userName ?? "User"}!
          </h1>
          <HeaderDateWeather />
        </div>
        <div className="flex items-center gap-2 text-white/72">
          {[Bell, Mail].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="grid size-9 place-items-center rounded-full border border-white/14 bg-white/7 transition hover:bg-white/13 hover:text-white"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <BusinessHeader />
          <GymCapacity />
          {/* <MobileAppPromo /> */}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-9">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <MetricCards />
            <RevenueAnalytics />
          </div>

          <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-1">
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

      <div className="w-full gap-6 grid-cols-1">
        <MembersTable />
      </div>
    </div>
  );
}
