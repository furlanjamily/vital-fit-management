import { Skeleton } from "@/components/common/skeleton";
import { SkeletonGlassPanel } from "@/components/common/skeleton/SkeletonGlassPanel";
import { cn } from "@/lib/cn";

type ExpenseBreakdownCardSkeletonProps = {
  className?: string;
};

export function ExpenseBreakdownCardSkeleton({ className }: ExpenseBreakdownCardSkeletonProps) {
  return (
    <SkeletonGlassPanel
      className={cn(
        "flex w-full flex-col rounded-[20px] sm:rounded-[22px] md:rounded-[24px]",
        className,
      )}
      label="Carregando despesas por categoria"
    >
      <div className="flex h-full min-h-[300px] flex-col p-4 sm:min-h-[320px] sm:p-5 md:p-6 lg:min-h-0">
        <Skeleton className="mx-auto h-4 w-40 rounded-md sm:mx-0 sm:h-[18px] sm:w-44" />

        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-5 sm:mt-3 sm:gap-6">
          <Skeleton className="aspect-square w-[130px] rounded-full sm:w-[145px] md:w-[160px] lg:w-[130px] xl:w-[150px] 2xl:w-[170px]" />

          <div className="grid w-full max-w-sm grid-cols-2 gap-x-4 gap-y-2.5 px-1">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="size-2 shrink-0 rounded-full" />
                <Skeleton className="h-2.5 flex-1 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonGlassPanel>
  );
}
