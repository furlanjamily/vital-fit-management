import type { CSSProperties, ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  MousePointer2,
  MoreHorizontal,
} from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type WorkoutScheduleVariant = "orange" | "amber";

type WorkoutSchedulePosition = "top" | "middle" | "bottom";

type WorkoutScheduleItem = {
  id: string;
  title: string;
  dateRange: string;
  variant: WorkoutScheduleVariant;
  position: WorkoutSchedulePosition;
  startDayIndex: number;
  endDayIndex: number;
  ghostEndDayIndex?: number;
  rotation?: number;
  showPointer?: boolean;
  showEllipsis?: boolean;
  height?: number;
};

const WORKOUT_SCHEDULE_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const TIMELINE_DATES = [
  "20 Jul",
  "21 Jul",
  "22 Jul",
  "23 Jul",
  "24 Jul",
  "25 Jul",
] as const;

const CURRENT_DAY_INDEX = 4;

const WORKOUT_ITEMS: WorkoutScheduleItem[] = [
  {
    id: "speed-power",
    title: "Speed & Power Training",
    dateRange: "21 Jul - 25 Jul",
    variant: "orange",
    position: "top",
    startDayIndex: 1.35,
    endDayIndex: 4,
    ghostEndDayIndex: 5.85,
    showEllipsis: true,
  },
  {
    id: "pace",
    title: "Pace Training",
    dateRange: "20 Jul - 23 Jul",
    variant: "amber",
    position: "middle",
    startDayIndex: 0.15,
    endDayIndex: 3.55,
    rotation: -4.5,
    showPointer: true,
    showEllipsis: true,
  },
  {
    id: "boxing",
    title: "Boxing",
    dateRange: "23 Jul - 25 Jul",
    variant: "orange",
    position: "bottom",
    startDayIndex: 2.85,
    endDayIndex: 4,
    ghostEndDayIndex: 5.75,
    showEllipsis: false,
    height: 32,
  },
];

const AVATAR_COLORS = ["#FF7A4A", "#FFB300"] as const;

const ghostStripeStyle: CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.55) 0px,
    rgba(255, 255, 255, 0.55) 1.5px,
    transparent 1.5px,
    transparent 5px
  )`,
};

type WorkoutScheduleGlassProps = {
  children: ReactNode;
};

function WorkoutScheduleGlass({ children }: WorkoutScheduleGlassProps) {
  return (
    <GlassPanel {...WORKOUT_SCHEDULE_GLASS} className="rounded-[16px]">
      {children}
    </GlassPanel>
  );
}

function dayIndexToPercent(dayIndex: number): number {
  const maxIndex = TIMELINE_DATES.length - 1;
  return (dayIndex / maxIndex) * 100;
}

type OverlappingAvatarsProps = {
  variant: WorkoutScheduleVariant;
};

function OverlappingAvatars({ variant }: OverlappingAvatarsProps) {
  const borderColor = variant === "amber" ? "#FFF2AF" : "#FF9A4A";

  return (
    <div className="flex shrink-0 -space-x-1.5">
      {AVATAR_COLORS.map((color, index) => (
        <span
          key={color}
          className={cn(
            "relative inline-flex size-[18px] items-center justify-center rounded-full border-[1.5px] text-[7px] font-semibold",
            glassText.primary,
          )}
          style={{
            backgroundColor: color,
            borderColor,
            zIndex: AVATAR_COLORS.length - index,
          }}
        >
          {index === 0 ? "A" : "B"}
        </span>
      ))}
    </div>
  );
}

type EllipsisBubbleProps = {
  variant: WorkoutScheduleVariant;
};

function EllipsisBubble({ variant }: EllipsisBubbleProps) {
  return (
    <span
      className={cn(
        "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)]",
        variant === "amber" ? "bg-white/95" : "bg-white",
      )}
    >
      <MoreHorizontal className="size-3 text-[#1a1a1a]/70" strokeWidth={2.5} />
    </span>
  );
}

type WorkoutBlockProps = {
  item: WorkoutScheduleItem;
};

function WorkoutBlock({ item }: WorkoutBlockProps) {
  const leftPercent = dayIndexToPercent(item.startDayIndex);
  const solidRightPercent = dayIndexToPercent(item.endDayIndex);
  const ghostRightPercent = item.ghostEndDayIndex
    ? dayIndexToPercent(item.ghostEndDayIndex)
    : solidRightPercent;
  const widthPercent = ghostRightPercent - leftPercent;
  const solidWidthPercent =
    ((solidRightPercent - leftPercent) / widthPercent) * 100;

  const isOrange = item.variant === "orange";
  const bgColor = isOrange ? "#FF9A4A" : "#FFF2AF";
  const textColor = "#1a1a1a";
  const subtitleColor = "#6B7280";
  const blockHeight = item.height ?? 38;

  const verticalPosition: Record<WorkoutSchedulePosition, string> = {
    top: "top-[14%]",
    middle: "top-[38%]",
    bottom: "top-[64%]",
  };

  return (
    <>
      <div
        className={cn("absolute z-20 flex items-center", verticalPosition[item.position])}
        style={{
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          height: blockHeight,
          transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
          transformOrigin: "left center",
        }}
      >
        <div
          className={cn(
            "relative flex h-full w-full items-center overflow-hidden rounded-full",
            item.rotation
              ? "shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
              : "shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
          )}
        >
          <div
            className="absolute inset-y-0 left-0 flex items-center gap-2 overflow-hidden rounded-full pl-2.5 pr-1.5"
            style={{
              width: `${solidWidthPercent}%`,
              backgroundColor: bgColor,
            }}
          >
            <OverlappingAvatars variant={item.variant} />
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[11px] font-bold leading-tight tracking-[-0.02em]"
                style={{ color: textColor }}
              >
                {item.title}
              </p>
              <p
                className="truncate text-[9px] leading-tight tracking-[-0.01em]"
                style={{ color: subtitleColor }}
              >
                {item.dateRange}
              </p>
            </div>
            {item.showEllipsis !== false && (
              <EllipsisBubble variant={item.variant} />
            )}
          </div>

          {item.ghostEndDayIndex && (
            <div
              className="absolute inset-y-0 rounded-r-full"
              style={{
                left: `${solidWidthPercent}%`,
                right: 0,
                backgroundColor: `${bgColor}99`,
                ...ghostStripeStyle,
              }}
            />
          )}
        </div>
      </div>

      {item.showPointer && (
        <MousePointer2
          className="absolute z-30 size-[14px] text-[#FF7A00]"
          style={{
            left: `${leftPercent + widthPercent * 0.42}%`,
            top: "54%",
            transform: "rotate(-12deg)",
          }}
          strokeWidth={2.25}
          fill="#FF7A00"
        />
      )}
    </>
  );
}

function TimelineGrid() {
  return (
    <>
      {TIMELINE_DATES.map((_, index) => {
        if (index === 0) return null;
        const leftPercent = dayIndexToPercent(index);
        return (
          <div
            key={`grid-${index}`}
            aria-hidden
            className="absolute inset-y-0 border-l border-dashed border-white/14"
            style={{ left: `${leftPercent}%` }}
          />
        );
      })}
    </>
  );
}

function CurrentDayMarker() {
  const leftPercent = dayIndexToPercent(CURRENT_DAY_INDEX);

  return (
    <div
      className="absolute inset-y-0 z-10 flex flex-col items-center"
      style={{ left: `${leftPercent}%`, transform: "translateX(-50%)" }}
    >
      <span className="flex size-[18px] items-center justify-center rounded-full border border-white/20 bg-white/12 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
        <MapPin className={cn("size-[9px]", glassText.secondary)} strokeWidth={2.25} />
      </span>
      <div className="mt-0.5 w-px flex-1 border-l border-dashed border-white/38" />
    </div>
  );
}

function DateAxis() {
  return (
    <div className="relative mt-1 grid grid-cols-6 px-0">
      {TIMELINE_DATES.map((date, index) => (
        <span
          key={date}
          className={cn(
            "text-center text-[9px] tracking-[-0.01em]",
            index === CURRENT_DAY_INDEX
              ? cn("font-semibold", glassText.secondary)
              : cn("font-normal", glassText.muted),
          )}
        >
          {date}
        </span>
      ))}
    </div>
  );
}

export function WorkoutScheduleExact() {
  return (
    <WorkoutScheduleGlass>
      <div className="overflow-hidden rounded-[inherit]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5 sm:px-5 sm:pt-4">
          <div className="flex items-center gap-2">
            <span className="flex size-[26px] items-center justify-center rounded-full bg-white/10">
              <CalendarDays
                className={cn("size-[13px]", glassText.secondary)}
                strokeWidth={2}
              />
            </span>
            <h3 className={cn(glassTextStyles.panelTitle, "text-[13px] font-bold tracking-[-0.03em] sm:text-sm")}>
              Workout Schedule
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="More options"
              className="flex size-[26px] items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/16"
            >
              <MoreHorizontal
                className={cn("size-[13px]", glassText.secondary)}
                strokeWidth={2.25}
              />
            </button>
            <button
              type="button"
              aria-label="Expand schedule"
              className="flex size-[26px] items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/16"
            >
              <ArrowUpRight
                className={cn("size-[13px]", glassText.secondary)}
                strokeWidth={2.25}
              />
            </button>
          </div>
        </div>

        {/* Timeline area */}
        <div className="relative mx-3 mb-3 h-[210px] overflow-hidden sm:mx-4 sm:mb-4 sm:h-[230px]">
          <TimelineGrid />
          <CurrentDayMarker />

          {WORKOUT_ITEMS.map((item) => (
            <WorkoutBlock key={item.id} item={item} />
          ))}
        </div>

        {/* Date axis */}
        <div className="px-3 pb-3.5 sm:px-4 sm:pb-4">
          <DateAxis />
        </div>
      </div>
    </WorkoutScheduleGlass>
  );
}
