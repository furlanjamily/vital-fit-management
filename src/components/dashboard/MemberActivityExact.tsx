import type { CSSProperties, ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { MemberActivityExactSkeleton } from "@/components/dashboard/MemberActivityExactSkeleton";
import type { MemberActivityViewData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/cn";

export { MemberActivityExactSkeleton as MemberActivityExactLoading } from "@/components/dashboard/MemberActivityExactSkeleton";

const MEMBER_ACTIVITY_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

type MemberActivityGlassProps = {
  children: ReactNode;
};

function MemberActivityGlass({ children }: MemberActivityGlassProps) {
  return (
    <GlassPanel {...MEMBER_ACTIVITY_GLASS} className="rounded-[16px]">
      {children}
    </GlassPanel>
  );
}

function getBubbleFontSize(size: number): string {
  if (size >= 120) return "text-[2rem]";
  if (size >= 95) return "text-[1.65rem]";
  if (size >= 70) return "text-[1.25rem]";
  return "text-[0.85rem]";
}

type ActivityBubbleGraphicProps = {
  bubble: MemberActivityViewData["bubbles"][number];
};

function ActivityBubbleGraphic({ bubble }: ActivityBubbleGraphicProps) {
  const fontSizeClass = getBubbleFontSize(bubble.size);
  const position: CSSProperties = {
    width: bubble.size,
    height: bubble.size,
    backgroundColor: bubble.color,
    zIndex: bubble.zIndex,
    left: bubble.position.left,
    top: bubble.position.top,
    transform: bubble.position.transform,
  };

  return (
    <div className="absolute grid place-items-center rounded-full" style={position}>
      <span
        className={`${fontSizeClass} font-semibold leading-none tracking-[-0.03em]`}
        style={{ color: bubble.textColor }}
      >
        {bubble.percentage}%
      </span>
    </div>
  );
}

type ActivityLegendRowProps = {
  item: MemberActivityViewData["legend"][number];
};

function ActivityLegendRow({ item }: ActivityLegendRowProps) {
  return (
    <div className="flex w-full min-w-0 items-center justify-center gap-1.5">
      <span
        className="size-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: item.color }}
      />
      <span className={cn("truncate text-[10px] tracking-[-0.01em]", glassText.secondary)}>
        {item.label}
      </span>
    </div>
  );
}

type MemberActivityExactProps = {
  data: MemberActivityViewData;
  isLoading?: boolean;
};

export function MemberActivityExact({ data, isLoading = false }: MemberActivityExactProps) {
  if (isLoading) {
    return <MemberActivityExactSkeleton />;
  }

  return (
    <MemberActivityGlass>
      <div className="px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
        <h3 className={cn(glassTextStyles.panelTitle, "text-[13px] tracking-[-0.03em] sm:text-sm")}>
          Alunos ativos
        </h3>

        <div className="relative mx-auto mt-3 h-[168px] w-full max-w-[280px] sm:mt-4 sm:h-[188px] sm:max-w-[300px]">
          {data.bubbles.map((bubble) => (
            <ActivityBubbleGraphic key={bubble.id} bubble={bubble} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:mt-4 sm:grid-cols-4 sm:gap-x-2">
          {data.legend.map((item) => (
            <ActivityLegendRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </MemberActivityGlass>
  );
}
