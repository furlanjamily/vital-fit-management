import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";
import { REVENUE_CHART_COLUMN_GAP, REVENUE_CHART_COLUMN_WIDTH } from "@/components/finance/finance.helpers";

const BAR_HEIGHTS = [48, 72, 56, 96, 64, 110, 78, 88, 52, 100, 70, 82];
const SKELETON_PERIOD = "yearly" as const;

export function RevenueOverviewExactSkeleton() {
  const columnWidth = REVENUE_CHART_COLUMN_WIDTH[SKELETON_PERIOD];
  const gap = REVENUE_CHART_COLUMN_GAP[SKELETON_PERIOD];

  return (
    <SkeletonGlassPanel
      className="w-full rounded-2xl px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6"
      label="Carregando receitas"
    >
      <div className="flex gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex flex-col gap-2">
          <Skeleton className="h-4 w-32 rounded-md sm:h-[18px] sm:w-36" />
          <Skeleton className="h-3 w-48 max-w-full rounded-md sm:w-56" />
        </div>

        <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-5">
        <Skeleton className="h-9 w-36 rounded-full self-start sm:h-11 sm:w-40 md:h-12" />

        <div className="relative min-w-0 w-full overflow-hidden">
          <div className="flex items-end pt-10" style={{ gap }}>
            {BAR_HEIGHTS.map((height, index) => (
              <div
                key={index}
                className="flex shrink-0 flex-col items-center justify-end"
                style={{ width: columnWidth }}
              >
                <Skeleton className="w-full rounded-full" style={{ height }} />
                <Skeleton className="mt-1.5 h-2 w-6 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonGlassPanel>
  );
}
