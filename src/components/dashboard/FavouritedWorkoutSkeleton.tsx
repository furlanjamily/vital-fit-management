import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";
import { WORKOUT_PILL_POSITIONS } from "@/components/dashboard/favourited-workout.helpers";
import { cn } from "@/lib/cn";

const TAB_SKELETON_WIDTHS = ["w-[88px]", "w-[56px]", "w-[44px]", "w-[72px]"] as const;

const PILL_SKELETON_WIDTHS = [
  "w-[88px]",
  "w-[96px]",
  "w-[72px]",
  "w-[84px]",
  "w-[76px]",
  "w-[80px]",
  "w-[92px]",
  "w-[68px]",
  "w-[86px]",
  "w-[74px]",
  "w-[78px]",
  "w-[82px]",
] as const;

export function FavouritedWorkoutSkeleton() {
  return (
    <SkeletonGlassPanel className="rounded-2xl p-5" label="Carregando treinos favoritos">
      <Skeleton className="mb-4 h-4 w-36 rounded-md" />

      <div className="mb-4 flex gap-4 overflow-x-auto border-b border-white/10 pb-3">
        {TAB_SKELETON_WIDTHS.map((width, index) => (
          <Skeleton
            key={index}
            className={cn("h-3 shrink-0 rounded-md", width, index === 0 && "opacity-90")}
          />
        ))}
      </div>

      <div className="relative h-[180px] rounded-xl bg-white/8">
        {WORKOUT_PILL_POSITIONS.map((position, index) => (
          <Skeleton
            key={position}
            className={cn(
              "absolute h-7 rounded-full",
              PILL_SKELETON_WIDTHS[index],
              index % 3 === 0
                ? "bg-linear-to-r from-orange-500/25 via-orange-400/20 to-orange-500/25"
                : undefined,
              position,
            )}
          />
        ))}
      </div>
    </SkeletonGlassPanel>
  );
}

export { FavouritedWorkoutSkeleton as FavouritedWorkoutLoading };
