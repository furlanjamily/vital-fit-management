import { DollarSign, TrendingUp, UserCheck, Users, UsersRound } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const metrics = [
  {
    icon: DollarSign,
    value: "$4,53k",
    label: "Month / July",
    change: "+2.1%",
  },
  {
    icon: Users,
    value: "89",
    label: "Active Members",
    change: "+1.8%",
  },
  {
    icon: UserCheck,
    value: "56",
    label: "Daily Average",
    change: "+1.3%",
  },
  {
    icon: UsersRound,
    value: "12",
    label: "Active Trainers",
    change: "+3.6%",
  },
] as const;

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <GlassPanel
          key={metric.label}
          variant="subtle"
          intensity="low"
          elevation="floating"
          className="rounded-2xl p-4"
        >
          <div className="mb-3 grid size-8 place-items-center rounded-lg border border-white/10 bg-white/10">
            <metric.icon className={cn("size-3.5", glassText.secondary)} />
          </div>
          <p className={glassTextStyles.kpiValue}>{metric.value}</p>
          <p className={cn("mt-0.5", glassTextStyles.kpiLabel)}>{metric.label}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <TrendingUp className="size-3" />
            {metric.change}
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
