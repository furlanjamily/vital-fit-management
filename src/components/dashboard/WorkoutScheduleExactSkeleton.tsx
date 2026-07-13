import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";

export function WorkoutScheduleExactSkeleton() {
  return (
    <SkeletonGlassPanel className="rounded-[16px]" label="Carregando agenda de treinos">
      <div className="overflow-hidden rounded-[inherit]">
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5 sm:px-5 sm:pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-[26px] rounded-full" />
            <Skeleton className="h-3.5 w-32 rounded-md sm:h-4 sm:w-36" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-[26px] rounded-full" />
            <Skeleton className="size-[26px] rounded-full" />
          </div>
        </div>

        <div className="relative mx-3 mb-3 h-[210px] overflow-hidden sm:mx-4 sm:mb-4 sm:h-[230px]">
          <Skeleton className="absolute left-[12%] top-[14%] h-[38px] w-[48%] rounded-full" />
          <Skeleton className="absolute left-[4%] top-[38%] h-[38px] w-[56%] rounded-full" />
          <Skeleton className="absolute left-[28%] top-[64%] h-8 w-[42%] rounded-full" />
        </div>

        <div className="grid grid-cols-6 gap-1 px-3 pb-3.5 sm:px-4 sm:pb-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="mx-auto h-2.5 w-8 rounded-sm" />
          ))}
        </div>
      </div>
    </SkeletonGlassPanel>
  );
}
