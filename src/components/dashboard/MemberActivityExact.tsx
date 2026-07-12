import type { CSSProperties, ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type ActivityBubble = {
  id: string;
  percentage: number;
  color: string;
  textColor: string;
  size: number;
  zIndex: number;
  position: CSSProperties;
};

type ActivityLegendItem = {
  id: string;
  label: string;
  color: string;
};

const MEMBER_ACTIVITY_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const ACTIVITY_BUBBLES: ActivityBubble[] = [
  {
    id: "primary",
    percentage: 90,
    color: "#FF7A00",
    textColor: "#FFFFFF",
    size: 132,
    zIndex: 10,
    position: {
      left: "0%",
      top: "50%",
      transform: "translateY(-50%)",
    },
  },
  {
    id: "amber",
    percentage: 89,
    color: "#FFB300",
    textColor: "#ffffff",
    size: 102,
    zIndex: 20,
    position: {
      left: "36%",
      top: "2%",
    },
  },
  {
    id: "green",
    percentage: 65,
    color: "#FF9800",
    textColor: "#FFFFFF",
    size: 78,
    zIndex: 30,
    position: {
      left: "40%",
      top: "48%",
    },
  },
  {
    id: "blue",
    percentage: 30,
    color: "#FF7A4A",
    textColor: "#FFFFFF",
    size: 52,
    zIndex: 40,
    position: {
      left: "58%",
      top: "32%",
    },
  },
];

const ACTIVITY_LEGEND: ActivityLegendItem[] = [
  { id: "morning", label: "08:00-10:00", color: "#FF7A4A" },
  { id: "midday-a", label: "10:00-14:00", color: "#FFB300" },
  { id: "midday-b", label: "10:00-14:00", color: "#FF9800" },
  { id: "midday-c", label: "10:00-14:00", color: "#FF9800" },
];

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
  bubble: ActivityBubble;
};

function ActivityBubbleGraphic({ bubble }: ActivityBubbleGraphicProps) {
  const fontSizeClass = getBubbleFontSize(bubble.size);

  return (
    <div
      className="absolute grid place-items-center rounded-full"
      style={{
        width: bubble.size,
        height: bubble.size,
        backgroundColor: bubble.color,
        zIndex: bubble.zIndex,
        ...bubble.position,
      }}
    >
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
  item: ActivityLegendItem;
};

function ActivityLegendRow({ item }: ActivityLegendRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
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

export function MemberActivityExact() {
  return (
    <MemberActivityGlass>
      <div className="px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
        <h3 className={cn(glassTextStyles.panelTitle, "text-[13px] tracking-[-0.03em] sm:text-sm")}>
          Member Activity
        </h3>

        <div className="relative mx-auto mt-3 h-[168px] w-full max-w-[280px] sm:mt-4 sm:h-[188px] sm:max-w-[300px]">
          {ACTIVITY_BUBBLES.map((bubble) => (
            <ActivityBubbleGraphic key={bubble.id} bubble={bubble} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:mt-4 sm:grid-cols-4 sm:gap-x-2">
          {ACTIVITY_LEGEND.map((item) => (
            <ActivityLegendRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </MemberActivityGlass>
  );
}
