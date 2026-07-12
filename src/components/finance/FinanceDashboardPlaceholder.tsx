import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const PLACEHOLDER_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

type FinanceDashboardPlaceholderProps = {
  label?: string;
};

export function FinanceDashboardPlaceholder({
  label = "Dashboard",
}: FinanceDashboardPlaceholderProps) {
  return (
    <GlassPanel {...PLACEHOLDER_GLASS} className="w-full rounded-[20px]">
      <div className="flex min-h-[180px] items-center justify-center px-6 py-10">
        <span className={cn("text-sm font-medium tracking-[-0.02em]", glassText.muted)}>
          {label}
        </span>
      </div>
    </GlassPanel>
  );
}
