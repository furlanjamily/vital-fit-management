"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { AgendaDateFilter } from "@/components/classes/AgendaDateFilter";
import {
  toIsoDate,
  type AgendaViewMode,
} from "@/components/classes/class-schedule.helpers";
import { EventCard } from "@/components/agenda/EventCard";
import {
  CALENDAR_END_HOUR,
  CALENDAR_GRID_HEIGHT,
  CALENDAR_HOUR_HEIGHT,
  CALENDAR_START_HOUR,
  DAY_COLUMN_MIN_WIDTH_PX,
  MONTH_CELL_MIN_WIDTH_PX,
  TIME_AXIS_WIDTH_PX,
  formatCalendarHeader,
  formatDayStripLabel,
  getEventsForDay,
  getMonthGrid,
  getWeekDays,
  isSameDay,
  isToday,
} from "@/components/agenda/agenda.helpers";
import { eventTypeColors, type AgendaEvent } from "@/components/agenda/agenda.types";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useDragScroll } from "@/hooks/useDragScroll";
import { cn } from "@/lib/cn";

const AGENDA_GLASS = {
  variant: "subtle" as const,
  intensity: "low" as const,
  elevation: "floating" as const,
};

const HOUR_LABELS = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, index) => CALENDAR_START_HOUR + index,
);

type CollaborativeCalendarProps = {
  events: AgendaEvent[];
  viewMode: AgendaViewMode;
  referenceDate: Date;
  onViewModeChange: (mode: AgendaViewMode) => void;
  onReferenceDateChange: (date: Date) => void;
  onCreateSlot?: (date: Date, hour: number) => void;
  onEventSelect?: (event: AgendaEvent) => void;
  isLoading?: boolean;
  className?: string;
};

/** Header/body sincronizados no eixo X; coluna de horas fixa com sync no eixo Y. */
function useCalendarScrollSync(layoutKey: string | number) {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [canDragScroll, setCanDragScroll] = useState(false);
  const { ref: headerScrollRef, handleMouseDown: handleHeaderDragScroll } =
    useDragScroll<HTMLDivElement>();
  const { ref: bodyScrollRef, handleMouseDown: handleBodyDragScroll } =
    useDragScroll<HTMLDivElement>();
  const timeAxisScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingHorizontal = useRef(false);
  const isSyncingVertical = useRef(false);

  function syncHorizontalScroll(source: "header" | "body") {
    if (isSyncingHorizontal.current) return;
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (!headerEl || !bodyEl) return;

    isSyncingHorizontal.current = true;
    if (source === "body") {
      headerEl.scrollLeft = bodyEl.scrollLeft;
    } else {
      bodyEl.scrollLeft = headerEl.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingHorizontal.current = false;
    });
  }

  function syncVerticalScroll(source: "axis" | "body") {
    if (isSyncingVertical.current) return;
    const axisEl = timeAxisScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (!axisEl || !bodyEl) return;

    isSyncingVertical.current = true;
    if (source === "body") {
      axisEl.scrollTop = bodyEl.scrollTop;
    } else {
      bodyEl.scrollTop = axisEl.scrollTop;
    }
    requestAnimationFrame(() => {
      isSyncingVertical.current = false;
    });
  }

  useEffect(() => {
    const bodyEl = bodyScrollRef.current;
    if (!bodyEl) return;

    function updateScrollMetrics() {
      if (!bodyEl) return;
      setScrollbarWidth(Math.max(0, bodyEl.offsetWidth - bodyEl.clientWidth));
      setCanDragScroll(bodyEl.scrollWidth > bodyEl.clientWidth + 1);
    }

    updateScrollMetrics();
    const observer = new ResizeObserver(updateScrollMetrics);
    observer.observe(bodyEl);
    return () => observer.disconnect();
  }, [bodyScrollRef, layoutKey]);

  return {
    headerScrollRef,
    bodyScrollRef,
    timeAxisScrollRef,
    handleHeaderDragScroll,
    handleBodyDragScroll,
    syncHorizontalScroll,
    syncVerticalScroll,
    scrollbarWidth,
    canDragScroll,
  };
}

/** Só header ↔ body no eixo X (visão mês). */
function useSyncedHorizontalScroll(layoutKey: string | number) {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const [canDragScroll, setCanDragScroll] = useState(false);
  const { ref: headerScrollRef, handleMouseDown: handleHeaderDragScroll } =
    useDragScroll<HTMLDivElement>();
  const { ref: bodyScrollRef, handleMouseDown: handleBodyDragScroll } =
    useDragScroll<HTMLDivElement>();
  const isSyncingScroll = useRef(false);

  function syncHorizontalScroll(source: "header" | "body") {
    if (isSyncingScroll.current) return;
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (!headerEl || !bodyEl) return;

    isSyncingScroll.current = true;
    if (source === "body") {
      headerEl.scrollLeft = bodyEl.scrollLeft;
    } else {
      bodyEl.scrollLeft = headerEl.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  }

  useEffect(() => {
    const bodyEl = bodyScrollRef.current;
    if (!bodyEl) return;

    function updateScrollMetrics() {
      if (!bodyEl) return;
      setScrollbarWidth(Math.max(0, bodyEl.offsetWidth - bodyEl.clientWidth));
      setCanDragScroll(bodyEl.scrollWidth > bodyEl.clientWidth + 1);
    }

    updateScrollMetrics();
    const observer = new ResizeObserver(updateScrollMetrics);
    observer.observe(bodyEl);
    return () => observer.disconnect();
  }, [bodyScrollRef, layoutKey]);

  return {
    headerScrollRef,
    bodyScrollRef,
    handleHeaderDragScroll,
    handleBodyDragScroll,
    syncHorizontalScroll,
    scrollbarWidth,
    canDragScroll,
  };
}

function TimeGridLines() {
  return (
    <>
      {HOUR_LABELS.map((hour) => (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-white/10"
          style={{ top: (hour - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT }}
        />
      ))}
    </>
  );
}

function TimeAxis() {
  return (
    <div
      className="relative shrink-0 border-r border-white/10 pr-2"
      style={{ width: TIME_AXIS_WIDTH_PX, height: CALENDAR_GRID_HEIGHT }}
    >
      {HOUR_LABELS.map((hour) => {
        const isFirst = hour === CALENDAR_START_HOUR;
        return (
          <span
            key={hour}
            className={cn(
              "absolute right-2 text-[10px] font-medium leading-none tabular-nums",
              !isFirst && "-translate-y-1/2",
              glassText.muted,
            )}
            style={{
              // Primeiro horário fica abaixo da borda (sem translate) para não cortar.
              top: isFirst
                ? 4
                : (hour - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT,
            }}
          >
            {hour.toString().padStart(2, "0")}:00
          </span>
        );
      })}
    </div>
  );
}

type TimeGridColumnProps = {
  day: Date;
  events: AgendaEvent[];
  onCreateSlot?: (date: Date, hour: number) => void;
  onEventSelect?: (event: AgendaEvent) => void;
};

function TimeGridColumn({ day, events, onCreateSlot, onEventSelect }: TimeGridColumnProps) {
  const dayEvents = getEventsForDay(events, toIsoDate(day));

  return (
    <div
      className="relative shrink-0 grow border-r border-white/8 last:border-r-0"
      style={{
        height: CALENDAR_GRID_HEIGHT,
        minWidth: DAY_COLUMN_MIN_WIDTH_PX,
        flexBasis: DAY_COLUMN_MIN_WIDTH_PX,
      }}
    >
      <TimeGridLines />

      {dayEvents.map((event) => (
        <EventCard key={event.id} event={event} onSelect={onEventSelect} />
      ))}

      {onCreateSlot
        ? HOUR_LABELS.map((hour) => (
            <button
              key={hour}
              type="button"
              aria-label={`Criar evento às ${hour}:00`}
              className={cn(
                "absolute inset-x-1 z-0 rounded-lg border border-dashed border-transparent opacity-0 transition",
                "hover:border-white/20 hover:bg-white/[0.04] hover:opacity-100",
              )}
              style={{
                top: (hour - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT,
                height: CALENDAR_HOUR_HEIGHT,
              }}
              onClick={() => onCreateSlot(day, hour)}
            >
              <Plus className={cn("mx-auto mt-4 size-4", glassText.muted)} />
            </button>
          ))
        : null}
    </div>
  );
}

type DayStripProps = {
  days: Date[];
  referenceDate: Date;
  onSelectDay: (date: Date) => void;
};

function DayStrip({ days, referenceDate, onSelectDay }: DayStripProps) {
  return (
    <div className="flex pb-3 pt-1">
      {days.map((day) => {
        const { weekday, day: dayNumber } = formatDayStripLabel(day);
        const active = isSameDay(day, referenceDate);

        return (
          <div
            key={toIsoDate(day)}
            className="shrink-0 grow px-1"
            style={{
              minWidth: DAY_COLUMN_MIN_WIDTH_PX,
              flexBasis: DAY_COLUMN_MIN_WIDTH_PX,
            }}
          >
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex w-full min-w-0 flex-col items-center rounded-2xl px-2 py-2.5 transition",
                active
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_8px_24px_rgba(249,115,22,0.28)]"
                  : "border border-white/10 bg-white/[0.06] hover:bg-white/10",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-medium capitalize",
                  active ? glassText.secondary : glassText.muted,
                )}
              >
                {weekday}
              </span>
              <span className={cn("text-sm font-bold", glassText.primary)}>
                {dayNumber}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

type WeekDayViewProps = {
  days: Date[];
  events: AgendaEvent[];
  referenceDate: Date;
  onSelectDay?: (date: Date) => void;
  onCreateSlot?: (date: Date, hour: number) => void;
  onEventSelect?: (event: AgendaEvent) => void;
  showDayStrip?: boolean;
};

function WeekDayView({
  days,
  events,
  referenceDate,
  onSelectDay,
  onCreateSlot,
  onEventSelect,
  showDayStrip = true,
}: WeekDayViewProps) {
  const daysMinWidth = days.length * DAY_COLUMN_MIN_WIDTH_PX;
  const {
    headerScrollRef,
    bodyScrollRef,
    timeAxisScrollRef,
    handleHeaderDragScroll,
    handleBodyDragScroll,
    syncHorizontalScroll,
    syncVerticalScroll,
    scrollbarWidth,
    canDragScroll,
  } = useCalendarScrollSync(days.length);

  const daysContentStyle = {
    minWidth: daysMinWidth,
    width: `max(100%, ${daysMinWidth}px)`,
  } as const;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-4 sm:px-4">
      {showDayStrip ? (
        <div className="flex shrink-0">
          <div
            className="shrink-0 border-r border-transparent"
            style={{ width: TIME_AXIS_WIDTH_PX }}
            aria-hidden
          />
          <div
            ref={headerScrollRef}
            onScroll={() => syncHorizontalScroll("header")}
            onMouseDown={canDragScroll ? handleHeaderDragScroll : undefined}
            className={cn(
              "min-w-0 flex-1 overflow-x-auto overflow-y-hidden scrollbar-none [-webkit-overflow-scrolling:touch]",
              canDragScroll && "cursor-grab active:cursor-grabbing",
            )}
            style={{ paddingRight: scrollbarWidth }}
          >
            <div style={daysContentStyle}>
              <DayStrip
                days={days}
                referenceDate={referenceDate}
                onSelectDay={onSelectDay ?? (() => {})}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1">
        <div
          ref={timeAxisScrollRef}
          onScroll={() => syncVerticalScroll("axis")}
          className="shrink-0 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ width: TIME_AXIS_WIDTH_PX }}
        >
          <TimeAxis />
        </div>

        <div
          ref={bodyScrollRef}
          onScroll={() => {
            syncHorizontalScroll("body");
            syncVerticalScroll("body");
          }}
          onMouseDown={canDragScroll ? handleBodyDragScroll : undefined}
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain",
            "[-webkit-overflow-scrolling:touch] scrollbar-thin",
            canDragScroll && "cursor-grab select-none active:cursor-grabbing",
          )}
        >
          <div className="flex" style={{ ...daysContentStyle, minHeight: CALENDAR_GRID_HEIGHT }}>
            {days.map((day) => (
              <TimeGridColumn
                key={toIsoDate(day)}
                day={day}
                events={events}
                onCreateSlot={onCreateSlot}
                onEventSelect={onEventSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type MonthViewProps = {
  referenceDate: Date;
  events: AgendaEvent[];
  onSelectDay: (date: Date) => void;
  onEventSelect?: (event: AgendaEvent) => void;
};

function MonthView({ referenceDate, events, onSelectDay, onEventSelect }: MonthViewProps) {
  const grid = getMonthGrid(referenceDate);
  const currentMonth = referenceDate.getMonth();
  const weekCount = Math.max(1, Math.ceil(grid.length / 7));
  const weekdayHeaders = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const monthMinWidth = 7 * MONTH_CELL_MIN_WIDTH_PX;
  const monthColumns = `repeat(7, minmax(${MONTH_CELL_MIN_WIDTH_PX}px, 1fr))`;
  const {
    headerScrollRef,
    bodyScrollRef,
    handleHeaderDragScroll,
    handleBodyDragScroll,
    syncHorizontalScroll,
    scrollbarWidth,
    canDragScroll,
  } = useSyncedHorizontalScroll(weekCount);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 sm:px-5">
      <div
        ref={headerScrollRef}
        onScroll={() => syncHorizontalScroll("header")}
        onMouseDown={canDragScroll ? handleHeaderDragScroll : undefined}
        className={cn(
          "shrink-0 overflow-x-auto overflow-y-hidden scrollbar-none [-webkit-overflow-scrolling:touch]",
          canDragScroll && "cursor-grab active:cursor-grabbing",
        )}
        style={{ paddingRight: scrollbarWidth }}
      >
        <div
          className="mb-2 grid gap-2"
          style={{ minWidth: monthMinWidth, gridTemplateColumns: monthColumns }}
        >
          {weekdayHeaders.map((label) => (
            <span
              key={label}
              className={cn("text-center text-[10px] font-semibold uppercase", glassText.muted)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={bodyScrollRef}
        onScroll={() => syncHorizontalScroll("body")}
        onMouseDown={canDragScroll ? handleBodyDragScroll : undefined}
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain pb-4",
          "[-webkit-overflow-scrolling:touch] scrollbar-thin",
          canDragScroll && "cursor-grab select-none active:cursor-grabbing",
        )}
      >
        <div
          className="grid gap-2"
          style={{
            minWidth: monthMinWidth,
            minHeight: "100%",
            gridTemplateColumns: monthColumns,
            gridTemplateRows: `repeat(${weekCount}, minmax(72px, 1fr))`,
          }}
        >
          {grid.map((day) => {
            const dayIso = toIsoDate(day);
            const dayEvents = getEventsForDay(events, dayIso);
            const inMonth = day.getMonth() === currentMonth;

            return (
              <div
                key={dayIso}
                className={cn(
                  "flex min-h-0 flex-col overflow-hidden rounded-2xl border p-2 text-left",
                  inMonth ? "border-white/10 bg-white/[0.04]" : "border-white/6 bg-white/[0.02] opacity-60",
                  isToday(day) && "ring-1 ring-orange-400/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className={cn(
                    "mb-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition hover:brightness-110",
                    isToday(day)
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-glass-primary"
                      : glassText.secondary,
                  )}
                >
                  {day.getDate()}
                </button>

                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event) => {
                    const colors = eventTypeColors[event.type];
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => onEventSelect?.(event)}
                        className="truncate rounded-md px-1.5 py-0.5 text-left text-[9px] font-semibold transition hover:brightness-95"
                        style={{ backgroundColor: colors.background, color: colors.text }}
                      >
                        {event.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => onSelectDay(day)}
                      className={cn("text-left text-[9px] transition hover:text-glass-primary", glassText.muted)}
                    >
                      +{dayEvents.length - 3} mais
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CollaborativeCalendar({
  events,
  viewMode,
  referenceDate,
  onViewModeChange,
  onReferenceDateChange,
  onCreateSlot,
  onEventSelect,
  isLoading = false,
  className,
}: CollaborativeCalendarProps) {
  const weekDays = getWeekDays(referenceDate);
  const headerLabel = formatCalendarHeader(referenceDate, viewMode);

  function handleSelectDay(date: Date) {
    onReferenceDateChange(date);
    if (viewMode === "month") {
      onViewModeChange("day");
    }
  }

  return (
    <div
      className={cn(
        "relative min-h-0 min-w-0 w-full max-w-full",
        "h-[100cqh] min-h-[100cqh]",
        "max-lg:flex-none lg:h-full lg:min-h-0 lg:flex-1",
        className,
      )}
    >
      <GlassPanel
        {...AGENDA_GLASS}
        className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-col overflow-hidden rounded-[20px]"
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit]",
            isLoading && "opacity-70",
          )}
        >
          <div className="flex shrink-0 flex-col gap-4 border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className={cn(glassTextStyles.panelTitle, "text-lg font-bold capitalize tracking-[-0.03em]")}>
                {headerLabel}
              </h2>

              <AgendaDateFilter
                viewMode={viewMode}
                referenceDate={referenceDate}
                onViewModeChange={onViewModeChange}
                onReferenceDateChange={onReferenceDateChange}
                className="w-full border-none bg-transparent p-0 lg:w-auto"
              />
            </div>
          </div>

          {viewMode === "month" ? (
            <MonthView
              referenceDate={referenceDate}
              events={events}
              onSelectDay={handleSelectDay}
              onEventSelect={onEventSelect}
            />
          ) : null}

          {viewMode === "week" ? (
            <WeekDayView
              days={weekDays}
              events={events}
              referenceDate={referenceDate}
              onSelectDay={onReferenceDateChange}
              onCreateSlot={onCreateSlot}
              onEventSelect={onEventSelect}
            />
          ) : null}

          {viewMode === "day" ? (
            <WeekDayView
              days={[referenceDate]}
              events={events}
              referenceDate={referenceDate}
              onCreateSlot={onCreateSlot}
              onEventSelect={onEventSelect}
              showDayStrip={false}
            />
          ) : null}
        </div>
      </GlassPanel>
    </div>
  );
}
