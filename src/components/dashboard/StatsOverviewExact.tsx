import type { ReactNode } from "react";
import { ClipboardList, Users } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type StatsCardIcon = "users" | "clipboard";

type StatsCardItem = {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: StatsCardIcon;
};

const STATS_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const STATS_CARDS: StatsCardItem[] = [
  {
    id: "new-members",
    title: "New Members",
    description: "Joined since 01 May compared with 01 Apr to 09 Apr",
    badge: "+2.3%",
    icon: "users",
  },
  {
    id: "visits-today",
    title: "Visits Today",
    description: "Visits today compared with 02 May",
    badge: "+2.3%",
    icon: "users",
  },
  {
    id: "visitors-this-month",
    title: "Visitors This Month",
    description: "Visits from 01 May compared with 01 Apr to 09 Apr",
    badge: "+2.3%",
    icon: "users",
  },
  {
    id: "bookings-this-month",
    title: "Bookings This Month",
    description: "Bookings since 01 May compared with 01 Apr to 09 Apr",
    badge: "+2.3%",
    icon: "clipboard",
  },
];

function StatsCardIconGraphic({ icon }: { icon: StatsCardIcon }) {
  const iconClassName = "size-[14px] text-white";

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
  card: StatsCardItem;
};

function StatsMetricCard({ card }: StatsMetricCardProps) {
  return (
    <StatsGlass className="rounded-[16px]">
      <div className="relative min-h-[112px] overflow-hidden rounded-[inherit] px-3.5 pb-3.5 pt-3 sm:min-h-[118px] sm:px-4 sm:pb-4 sm:pt-3.5">
        <span className={cn("inline-flex items-center rounded-md bg-white/12 px-1.5 py-px text-[10px] font-semibold tracking-[-0.02em]", glassText.primary)}>
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
          <p className={cn("mt-1 text-[10px] leading-[1.4] tracking-[-0.01em]", glassTextStyles.kpiLabel)}>
            {card.description}
          </p>
        </div>
      </div>
    </StatsGlass>
  );
}

export function StatsOverviewExact() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
      {STATS_CARDS.map((card) => (
        <StatsMetricCard key={card.id} card={card} />
      ))}
    </div>
  );
}
