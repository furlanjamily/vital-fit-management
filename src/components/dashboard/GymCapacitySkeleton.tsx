import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";

const ROWS = 10;
const COLS = 14;

export function GymCapacitySkeleton() {
  return (
    <SkeletonGlassPanel className="h-full rounded-2xl p-5" label="Carregando capacidade da academia">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-36 rounded-md" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-full" />
      </div>

      <div
        className="grid h-full gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, index) => (
          <Skeleton key={index} className="size-1.5 rounded-full" />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>
    </SkeletonGlassPanel>
  );
}
