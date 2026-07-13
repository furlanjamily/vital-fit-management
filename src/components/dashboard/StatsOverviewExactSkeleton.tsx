import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";

function StatsMetricCardSkeleton() {
  return (
    <SkeletonGlassPanel className="rounded-[16px]" label="Carregando métrica">
      <div className="relative min-h-[112px] overflow-hidden rounded-[inherit] px-3.5 pb-3.5 pt-3 sm:min-h-[118px] sm:px-4 sm:pb-4 sm:pt-3.5">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="absolute -right-3.5 -top-3.5 size-[58px] rounded-full" />
        <div className="relative mt-3 max-w-[calc(100%-2.25rem)] sm:mt-3.5">
          <Skeleton className="h-3.5 w-3/4 rounded-md sm:h-4" />
          <Skeleton className="mt-2 h-2.5 w-full rounded-md" />
          <Skeleton className="mt-1 h-2.5 w-5/6 rounded-md" />
        </div>
      </div>
    </SkeletonGlassPanel>
  );
}

export function StatsOverviewExactSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5"
      aria-busy="true"
      aria-label="Carregando estatísticas"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <StatsMetricCardSkeleton key={index} />
      ))}
    </div>
  );
}
