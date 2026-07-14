"use client";

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
      style={{ width: 52, height: CALENDAR_GRID_HEIGHT }}
    >
      {HOUR_LABELS.map((hour) => (
        <span
          key={hour}
          className={cn(
            "absolute right-2 -translate-y-1/2 text-[10px] font-medium tabular-nums",
            glassText.muted,
          )}
          style={{ top: (hour - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT }}
        >
          {hour.toString().padStart(2, "0")}:00
        </span>
      ))}
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
      className="relative min-w-0 flex-1 border-r border-white/8 last:border-r-0"
      style={{ height: CALENDAR_GRID_HEIGHT }}
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
    <div className="grid grid-cols-7 gap-2 px-4 pb-3 pt-1 sm:px-5">
      {days.map((day) => {
        const { weekday, day: dayNumber } = formatDayStripLabel(day);
        const active = isSameDay(day, referenceDate);

        return (
          <button
            key={toIsoDate(day)}
            type="button"
            onClick={() => onSelectDay(day)}
            className={cn(
              "flex flex-col items-center rounded-2xl px-2 py-2.5 transition",
              active
                ? "bg-[#1a1a1a] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                : "border border-white/10 bg-white/[0.06] hover:bg-white/10",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-medium capitalize",
                active ? "text-white/70" : glassText.muted,
              )}
            >
              {weekday}
            </span>
            <span className={cn("text-sm font-bold", active ? "text-white" : glassText.primary)}>
              {dayNumber}
            </span>
          </button>
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
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showDayStrip ? (
        <DayStrip days={days} referenceDate={referenceDate} onSelectDay={onSelectDay ?? (() => {})} />
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto px-3 pb-4 sm:px-4">
        <div className="flex" style={{ minHeight: CALENDAR_GRID_HEIGHT }}>
          <TimeAxis />
          <div className="flex min-w-0 flex-1">
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
  const weekdayHeaders = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="px-4 pb-4 sm:px-5">
      <div className="mb-2 grid grid-cols-7 gap-2">
        {weekdayHeaders.map((label) => (
          <span
            key={label}
            className={cn("text-center text-[10px] font-semibold uppercase", glassText.muted)}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.map((day) => {
          const dayIso = toIsoDate(day);
          const dayEvents = getEventsForDay(events, dayIso);
          const inMonth = day.getMonth() === currentMonth;

          return (
            <div
              key={dayIso}
              className={cn(
                "flex min-h-[88px] flex-col rounded-2xl border p-2 text-left",
                inMonth ? "border-white/10 bg-white/[0.04]" : "border-white/6 bg-white/[0.02] opacity-60",
                isToday(day) && "ring-1 ring-orange-400/50",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className={cn(
                  "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold transition hover:brightness-110",
                  isToday(day) ? "bg-[#1a1a1a] text-white" : glassText.secondary,
                )}
              >
                {day.getDate()}
              </button>

              <div className="flex flex-col gap-1">
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
    <GlassPanel {...AGENDA_GLASS} className={cn("flex min-h-0 flex-1 flex-col rounded-[20px]", className)}>
      <div className={cn("flex min-h-0 flex-1 flex-col rounded-[inherit]", isLoading && "opacity-70")}>
        <div className="shrink-0 flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
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
          <div className="min-h-0 flex-1 overflow-y-auto">
            <MonthView
              referenceDate={referenceDate}
              events={events}
              onSelectDay={handleSelectDay}
              onEventSelect={onEventSelect}
            />
          </div>
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
  );
}