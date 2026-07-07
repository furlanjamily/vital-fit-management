import {
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Swords,
} from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { cn } from "@/lib/cn";

const tabs = ["All Workouts", "Martial Arts", "Weighted", "Calisthenic"];

const workoutTags = [
  {
    label: "Tricep Dips",
    icon: Dumbbell,
    style: "top-[12%] left-[8%]",
    variant: "light" as const,
  },
  {
    label: "Callisthenics",
    icon: Flame,
    style: "top-[8%] left-[38%]",
    variant: "dark" as const,
  },
  {
    label: "Yoga",
    icon: Heart,
    style: "top-[22%] right-[12%]",
    variant: "light" as const,
  },
  {
    label: "Kickboxing",
    icon: Swords,
    style: "top-[42%] left-[18%]",
    variant: "dark" as const,
  },
  {
    label: "Cycling",
    icon: Bike,
    style: "top-[38%] right-[8%]",
    variant: "light" as const,
  },
  {
    label: "Running",
    icon: Footprints,
    style: "bottom-[28%] left-[32%]",
    variant: "dark" as const,
  },
  {
    label: "Stretching",
    icon: Heart,
    style: "bottom-[18%] right-[22%]",
    variant: "light" as const,
  },
  {
    label: "Boxing",
    icon: Swords,
    style: "bottom-[32%] left-[6%]",
    variant: "dark" as const,
  },
];

export function FavouritedWorkout() {
  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className="rounded-2xl p-5"
    >
      <p className="mb-4 text-sm font-semibold text-white">Favourited Workout</p>

      <div className="mb-4 flex gap-4 overflow-x-auto border-b border-white/10 pb-3 text-[11px]">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "shrink-0 pb-1 transition",
              index === 0
                ? "border-b border-white font-semibold text-white"
                : "text-white/40 hover:text-white/70",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative h-[180px] rounded-xl bg-black/15">
        {workoutTags.map((tag) => (
          <span
            key={tag.label}
            className={cn(
              "absolute inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold",
              tag.variant === "light"
                ? "bg-white text-[#1a1d19]"
                : "border border-white/14 bg-white/8 text-white/80",
              tag.style,
            )}
          >
            <tag.icon className="size-3" />
            {tag.label}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}
