import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";

export function MemberActivityExactSkeleton() {
  return (
    <SkeletonGlassPanel className="rounded-[16px]" label="Carregando atividade de membros">
      <div className="px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
        <Skeleton className="h-3.5 w-32 rounded-md sm:h-4 sm:w-36" />

        <div className="relative mx-auto mt-3 h-[168px] w-full max-w-[280px] sm:mt-4 sm:h-[188px] sm:max-w-[300px]">
          <Skeleton className="absolute left-[8%] top-[18%] size-[72px] rounded-full" />
          <Skeleton className="absolute left-[38%] top-[8%] size-[95px] rounded-full" />
          <Skeleton className="absolute right-[10%] top-[22%] size-[58px] rounded-full" />
          <Skeleton className="absolute bottom-[20%] left-[28%] size-[44px] rounded-full" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:mt-4 sm:grid-cols-4 sm:gap-x-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex min-w-0 items-center gap-1.5">
              <Skeleton className="size-[7px] shrink-0 rounded-full" />
              <Skeleton className="h-2.5 flex-1 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonGlassPanel>
  );
}
