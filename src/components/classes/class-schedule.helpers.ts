export type AgendaViewMode = "day" | "week" | "month";

export type DateRange = {
  start: Date;
  end: Date;
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeDateRange(referenceDate: Date, viewMode: AgendaViewMode): DateRange {
  const reference = startOfDay(referenceDate);

  if (viewMode === "day") {
    return { start: reference, end: endOfDay(reference) };
  }

  if (viewMode === "week") {
    const day = reference.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(reference);
    start.setDate(reference.getDate() + diffToMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end: endOfDay(end) };
  }

  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { start, end: endOfDay(end) };
}

export function formatAgendaReferenceLabel(referenceDate: Date, viewMode: AgendaViewMode): string {
  if (viewMode === "day") {
    return referenceDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const range = computeDateRange(referenceDate, viewMode);
  const startLabel = range.start.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  const endLabel = range.end.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

export function shiftReferenceDate(
  referenceDate: Date,
  viewMode: AgendaViewMode,
  direction: -1 | 1,
): Date {
  const next = new Date(referenceDate);

  if (viewMode === "day") {
    next.setDate(next.getDate() + direction);
    return next;
  }

  if (viewMode === "week") {
    next.setDate(next.getDate() + direction * 7);
    return next;
  }

  next.setMonth(next.getMonth() + direction);
  return next;
}

export function getDayOfWeekFromIso(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

/** Rótulo de seção por dia (ex.: "segunda-feira, 14 de julho"). */
export function formatAgendaDayGroupLabel(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
