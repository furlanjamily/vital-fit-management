import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { WorkoutScheduleExactSkeleton } from "@/components/dashboard/WorkoutScheduleExactSkeleton";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import {
  type WorkoutScheduleItem,
  type WorkoutSchedulePosition,
  type WorkoutScheduleVariant,
  type WorkoutScheduleViewData,
} from "@/hooks/useWorkoutSchedule";
import { cn } from "@/lib/cn";

export { WorkoutScheduleExactSkeleton as WorkoutScheduleExactLoading } from "@/components/dashboard/WorkoutScheduleExactSkeleton";

const WORKOUT_SCHEDULE_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const AVATAR_COLORS = ["#FF7A4A", "#FFB300"] as const;

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
  return (dayIndex / 6) * 100;
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
  const rightPercent = dayIndexToPercent(item.endDayIndex);
  const widthPercent = rightPercent - leftPercent;

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
        }}
      >
        <div
          className={cn(
            "relative flex h-full w-full items-center overflow-hidden rounded-full",
            "shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
          )}
        >
          <div
            className="absolute inset-y-0 left-0 flex items-center gap-2 overflow-hidden rounded-full pl-2.5 pr-1.5"
            style={{
              width: "100%",
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
            <EllipsisBubble variant={item.variant} />
          </div>
        </div>
      </div>
    </>
  );
}

function TimelineGrid({ timelineDates }: { timelineDates: string[] }) {
  return (
    <>
      {timelineDates.map((date, index) => {
        const leftPercent = (index / timelineDates.length) * 100;
        return (
          <div
            key={date}
            aria-hidden
            className="absolute inset-y-0 border-l border-dashed border-white/14"
            style={{ left: `${leftPercent}%` }}
          />
        );
      })}
    </>
  );
}

function CurrentDayMarker({ currentDayIndex }: { currentDayIndex: number | null }) {
  if (currentDayIndex === null) return null;
  const leftPercent = ((currentDayIndex + 0.5) / 6) * 100;

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

function DateAxis({
  timelineDates,
  currentDayIndex,
}: Pick<WorkoutScheduleViewData, "timelineDates" | "currentDayIndex">) {
  return (
    <div className="relative mt-1 grid grid-cols-6 px-0">
      {timelineDates.map((date, index) => (
        <span
          key={date}
          className={cn(
            "text-center text-[9px] tracking-[-0.01em]",
            index === currentDayIndex
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

type WorkoutScheduleExactProps = {
  data: WorkoutScheduleViewData;
  isLoading: boolean;
  error?: string | null;
};

export function WorkoutScheduleExact({ data, isLoading, error }: WorkoutScheduleExactProps) {
  if (isLoading) return <WorkoutScheduleExactSkeleton />;

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
              Agenda de treinos
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
          <TimelineGrid timelineDates={data.timelineDates} />
          <CurrentDayMarker currentDayIndex={data.currentDayIndex} />

          {data.items.map((item) => (
            <WorkoutBlock key={item.id} item={item} />
          ))}
        </div>

        {/* Date axis */}
        <div className="px-3 pb-3.5 sm:px-4 sm:pb-4">
          <DateAxis timelineDates={data.timelineDates} currentDayIndex={data.currentDayIndex} />
        </div>

        {error ? <InlineAlert className="mx-4 mb-4">{error}</InlineAlert> : null}
      </div>
    </WorkoutScheduleGlass>
  );
}
