export const CLASS_SCHEDULE_NAMES = [
  "Crossfit",
  "Dança",
  "Jump",
  "Pilates",
  "Spinning",
  "TRX",
  "Yoga",
] as const;

export type ClassScheduleName = (typeof CLASS_SCHEDULE_NAMES)[number];

export const WEEKDAY_OPTIONS = [
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
] as const;

export const weekdayLabels: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export const weekdayShortLabels: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export function formatScheduleWeekdays(weekdays: number[]): string {
  if (weekdays.length === 0) return "Nenhum dia configurado na grade";

  return weekdays.map((day) => weekdayShortLabels[day] ?? String(day)).join(", ");
}

export type ClassSchedule = {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: number;
  startTime: string;
  professionalId: string;
  professionalName: string;
  professionalSpecialty: string;
  maxCapacity: number;
  createdAt: string;
};

export type ClassScheduleFormValues = {
  className: string;
  professionalId: string;
  dayOfWeek: string;
  startTime: string;
  maxCapacity: string;
};

export const classScheduleNameOptions = CLASS_SCHEDULE_NAMES.map((name) => ({
  value: name,
  label: name,
}));
