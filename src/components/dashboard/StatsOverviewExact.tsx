import type { ReactNode } from "react";
import { ClipboardList, Users } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { StatsOverviewExactSkeleton } from "@/components/dashboard/StatsOverviewExactSkeleton";
import type { StatsOverviewViewData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/cn";

export { StatsOverviewExactSkeleton as StatsOverviewExactLoading } from "@/components/dashboard/StatsOverviewExactSkeleton";

type StatsCardIcon = "users" | "clipboard";

const STATS_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

function StatsCardIconGraphic({ icon }: { icon: StatsCardIcon }) {
  const iconClassName = cn("size-[14px]", glassText.primary);

  if (icon === "clipboard") {
    return <ClipboardList className={iconClassName} strokeWidth={2} />;
  }

  return <Users className={iconClassName} strokeWidth={2} />;
}

type StatsGlassProps = {
  className?: string;
  children: ReactNode;
};

function StatsGlass({ className, children }: StatsGlassProps) {
  return (
    <GlassPanel {...STATS_GLASS} className={className}>
      {children}
    </GlassPanel>
  );
}

type StatsMetricCardProps = {
  card: StatsOverviewViewData["cards"][number];
};

function StatsMetricCard({ card }: StatsMetricCardProps) {
  return (
    <StatsGlass className="rounded-[16px]">
      <div className="relative min-h-[112px] overflow-hidden rounded-[inherit] px-3.5 pb-3.5 pt-3 sm:min-h-[118px] sm:px-4 sm:pb-4 sm:pt-3.5">
        <span
          className={cn(
            "inline-flex items-center rounded-md bg-white/12 px-1.5 py-px text-[10px] font-semibold tracking-[-0.02em]",
            glassText.primary,
          )}
        >
          {card.badge}
        </span>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-3.5 -top-3.5 grid size-[58px] place-items-center rounded-full bg-orange-500"
        >
          <StatsCardIconGraphic icon={card.icon} />
        </div>

        <div className="relative mt-3 max-w-[calc(100%-2.25rem)] sm:mt-3.5">
          <h3 className={cn(glassTextStyles.kpiValue, "text-[13px] leading-tight sm:text-[14px]")}>
            {card.title}
          </h3>
          <p
            className={cn(
              "mt-1 text-[10px] leading-[1.4] tracking-[-0.01em]",
              glassTextStyles.kpiLabel,
            )}
          >
            {card.description}
          </p>
        </div>
      </div>
    </StatsGlass>
  );
}

type StatsOverviewExactProps = {
  data: StatsOverviewViewData;
  isLoading?: boolean;
};

export function StatsOverviewExact({ data, isLoading = false }: StatsOverviewExactProps) {
  if (isLoading) {
    return <StatsOverviewExactSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
      {data.cards.map((card) => (
        <StatsMetricCard key={card.id} card={card} />
      ))}
    </div>
  );
}
