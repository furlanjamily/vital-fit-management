import {
  computeDateRange,
  toIsoDate,
  type AgendaViewMode,
} from "@/components/classes/class-schedule.helpers";
import type { AgendaEvent, AgendaUserOption, EventRow } from "@/components/agenda/agenda.types";

export const CALENDAR_START_HOUR = 6;
export const CALENDAR_END_HOUR = 20;
export const CALENDAR_HOUR_HEIGHT = 56;
export const CALENDAR_GRID_HEIGHT =
  (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * CALENDAR_HOUR_HEIGHT;

type EventParticipantJoin = {
  user_id: string;
};

type EventRowWithParticipants = EventRow & {
  event_participants: EventParticipantJoin[];
};

export function mapEventRow(
  row: EventRowWithParticipants,
  userLookup: Map<string, AgendaUserOption>,
): AgendaEvent {
  const participants = row.event_participants.map(({ user_id }) => {
    const user = userLookup.get(user_id);
    return {
      userId: user_id,
      name: user?.name ?? "Usuário",
      avatarUrl: user?.avatarUrl ?? null,
    };
  });

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startTime: row.start_time,
    endTime: row.end_time,
    type: row.type,
    meetingLink: row.meeting_link,
    location: row.location,
    createdBy: row.created_by,
    participants,
  };
}

export function buildEventTimestamps(date: string, startTime: string, endTime: string) {
  // Wall clock em America/Sao_Paulo (sem DST no Brasil) → UTC ISO para timestamptz
  return {
    startTime: new Date(`${date}T${startTime}:00-03:00`).toISOString(),
    endTime: new Date(`${date}T${endTime}:00-03:00`).toISOString(),
  };
}

export function formatEventTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function getEventsForDay(events: AgendaEvent[], dayIso: string): AgendaEvent[] {
  return events.filter((event) => toIsoDate(new Date(event.startTime)) === dayIso);
}

export function getWeekDays(referenceDate: Date): Date[] {
  const { start } = computeDateRange(referenceDate, "week");
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function getMonthGrid(referenceDate: Date): Date[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);

  const cells: Date[] = [];
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  for (let index = 0; index < totalCells; index += 1) {
    const cell = new Date(gridStart);
    cell.setDate(gridStart.getDate() + index);
    cells.push(cell);
  }

  return cells;
}

export function computeEventLayout(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const gridStartMinutes = CALENDAR_START_HOUR * 60;
  const gridEndMinutes = CALENDAR_END_HOUR * 60;

  const clampedStart = Math.max(startMinutes, gridStartMinutes);
  const clampedEnd = Math.min(endMinutes, gridEndMinutes);

  if (clampedEnd <= gridStartMinutes || clampedStart >= gridEndMinutes) {
    return null;
  }

  const top =
    ((clampedStart - gridStartMinutes) / 60) * CALENDAR_HOUR_HEIGHT;
  const height = Math.max(
    ((clampedEnd - clampedStart) / 60) * CALENDAR_HOUR_HEIGHT,
    28,
  );

  return { top, height };
}

export function formatCalendarHeader(referenceDate: Date, viewMode: AgendaViewMode): string {
  if (viewMode === "day") {
    return referenceDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return referenceDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function formatDayStripLabel(date: Date): { weekday: string; day: string } {
  return {
    weekday: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    day: String(date.getDate()),
  };
}

export function isSameDay(left: Date, right: Date): boolean {
  return toIsoDate(left) === toIsoDate(right);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatEventSubject(event: AgendaEvent): string {
  return `${event.title} — ${formatEventTimeRange(event.startTime, event.endTime)}`;
}

export function handleEventClick(event: AgendaEvent) {
  if (event.type === "reuniao" && event.meetingLink) {
    window.open(event.meetingLink, "_blank", "noopener,noreferrer");
  }
}
