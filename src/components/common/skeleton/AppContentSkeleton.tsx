"use client";

import { Skeleton } from "@/components/common/skeleton/Skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";

type AppContentSkeletonProps = {
  label?: string;
  showKpis?: boolean;
  rows?: number;
};

export function AppContentSkeleton({
  label = "Carregando página",
  showKpis = false,
  rows = 6,
}: AppContentSkeletonProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6" aria-busy="true" aria-label={label}>
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-[65vw]" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {showKpis ? (
        <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonGlassPanel key={index} className="h-24 rounded-2xl p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-4 h-6 w-24" />
            </SkeletonGlassPanel>
          ))}
        </div>
      ) : null}

      <div className="flex shrink-0 flex-wrap gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <SkeletonGlassPanel className="flex min-h-0 flex-1 flex-col rounded-2xl px-4 pt-3 sm:px-5">
        <div className="flex shrink-0 gap-5 border-b border-white/10 pb-3 pt-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex flex-1 flex-col">
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-5 border-b border-white/6 py-3.5"
            >
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonGlassPanel>
    </div>
  );
}
