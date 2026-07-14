"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DISPLAY_WEEKDAY_START = 1; // Monday, matching Date#getDay().
const DISPLAY_DAYS = 6; // Monday through Saturday.
const ASSUMED_CLASS_DURATION_MINUTES = 60;

export type WorkoutScheduleVariant = "orange" | "amber";
export type WorkoutSchedulePosition = "top" | "middle" | "bottom";

export type WorkoutScheduleItem = {
  id: string;
  title: string;
  dateRange: string;
  variant: WorkoutScheduleVariant;
  position: WorkoutSchedulePosition;
  startDayIndex: number;
  endDayIndex: number;
  height?: number;
};

export type WorkoutScheduleViewData = {
  items: WorkoutScheduleItem[];
  timelineDates: string[];
  currentDayIndex: number | null;
};

type ScheduleRow = {
  id: string;
  day_of_week: number;
  start_time: string;
  classes: { name: string } | { name: string }[] | null;
};

type DatedScheduleRow = ScheduleRow & {
  date: Date;
};

function atMidday(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Monday is the first day of the dashboard timeline. */
export function getCurrentScheduleWeek(today = new Date()): Date[] {
  const currentDate = atMidday(today);
  const daysSinceMonday = (currentDate.getDay() + 6) % 7;
  const monday = addDays(currentDate, -daysSinceMonday);

  return Array.from({ length: DISPLAY_DAYS }, (_, index) => addDays(monday, index));
}

export function dayOfWeekToTimelineIndex(dayOfWeek: number): number | null {
  const index = dayOfWeek - DISPLAY_WEEKDAY_START;
  return index >= 0 && index < DISPLAY_DAYS ? index : null;
}

function resolveClassName(classes: ScheduleRow["classes"]): string {
  if (!classes) return "Aula";
  return Array.isArray(classes) ? (classes[0]?.name ?? "Aula") : classes.name;
}

function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function formatTimelineDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

function variantForClass(className: string): WorkoutScheduleVariant {
  const hash = [...className].reduce((total, character) => total + character.charCodeAt(0), 0);
  return hash % 2 === 0 ? "orange" : "amber";
}

/**
 * Assigns a vertical lane by time, reusing a lane only after its previous
 * class has ended. This keeps simultaneous classes visually separate.
 */
function assignPositions(rows: DatedScheduleRow[]): Map<string, WorkoutSchedulePosition> {
  const positions: WorkoutSchedulePosition[] = ["top", "middle", "bottom"];
  const positionById = new Map<string, WorkoutSchedulePosition>();
  const rowsByDay = new Map<number, DatedScheduleRow[]>();

  for (const row of rows) {
    const dayKey = row.date.getTime();
    const dayRows = rowsByDay.get(dayKey) ?? [];
    dayRows.push(row);
    rowsByDay.set(dayKey, dayRows);
  }

  for (const dayRows of rowsByDay.values()) {
    const laneEndTimes = new Array<number>(positions.length).fill(-1);

    for (const row of [...dayRows].sort((a, b) => a.start_time.localeCompare(b.start_time))) {
      const startTime = toMinutes(row.start_time);
      const availableLane = laneEndTimes.findIndex((endTime) => endTime <= startTime);
      const laneIndex =
        availableLane >= 0
          ? availableLane
          : laneEndTimes.reduce(
              (earliestIndex, endTime, index) =>
                endTime < laneEndTimes[earliestIndex] ? index : earliestIndex,
              0,
            );

      laneEndTimes[laneIndex] = startTime + ASSUMED_CLASS_DURATION_MINUTES;
      positionById.set(row.id, positions[laneIndex]);
    }
  }

  return positionById;
}

export function adaptWorkoutSchedule(
  rows: ScheduleRow[],
  today = new Date(),
): WorkoutScheduleViewData {
  const week = getCurrentScheduleWeek(today);
  const dateByDayOfWeek = new Map(week.map((date) => [date.getDay(), date]));
  const datedRows = rows
    .map((row) => {
      const date = dateByDayOfWeek.get(row.day_of_week);
      return date ? { ...row, date } : null;
    })
    .filter((row): row is DatedScheduleRow => row !== null);
  const positionById = assignPositions(datedRows);
  const todayKey = atMidday(today).toDateString();
  const currentDayIndex = week.findIndex(
    (date) => date.toDateString() === todayKey,
  );

  return {
    timelineDates: week.map(formatTimelineDate),
    currentDayIndex: currentDayIndex >= 0 ? currentDayIndex : null,
    items: datedRows
      .filter((row) => row.date.toDateString() === todayKey)
      .filter((row) => dayOfWeekToTimelineIndex(row.day_of_week) !== null)
      .map((row) => {
        return {
          id: row.id,
          title: resolveClassName(row.classes),
          dateRange: `${formatDate(row.date)} · ${row.start_time.slice(0, 5)}`,
          variant: variantForClass(resolveClassName(row.classes)),
          position: positionById.get(row.id) ?? "top",
          // The card is scoped to today, so it uses the full timeline width.
          startDayIndex: 0.04,
          endDayIndex: DISPLAY_DAYS - 0.04,
          height: 38,
        };
      }),
  };
}

const EMPTY_WORKOUT_SCHEDULE: WorkoutScheduleViewData = {
  items: [],
  timelineDates: getCurrentScheduleWeek().map(formatTimelineDate),
  currentDayIndex: null,
};

export function useWorkoutSchedule() {
  const [data, setData] = useState<WorkoutScheduleViewData>(EMPTY_WORKOUT_SCHEDULE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const weekKey = useMemo(() => getCurrentScheduleWeek().map((date) => date.toDateString()).join(","), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const today = new Date();
      const { data: rows, error: queryError } = await supabase
        .from("gym_settings_schedule")
        .select("id, day_of_week, start_time, classes ( name )")
        .eq("day_of_week", today.getDay())
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (cancelled) return;

      if (queryError) {
        setError(queryError.message);
        setData({ ...EMPTY_WORKOUT_SCHEDULE, timelineDates: getCurrentScheduleWeek().map(formatTimelineDate) });
      } else {
        setData(adaptWorkoutSchedule((rows ?? []) as ScheduleRow[], today));
      }

      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [weekKey]);

  return { data, isLoading, error };
}
