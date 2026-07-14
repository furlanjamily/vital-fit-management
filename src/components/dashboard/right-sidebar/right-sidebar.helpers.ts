import type { AgendaEvent } from "@/components/agenda/agenda.types";
import { formatEventTimeRange } from "@/components/agenda/agenda.helpers";

export function formatUpNextCountdown(startTimeIso: string, now = new Date()): string {
  const start = new Date(startTimeIso);
  const diffMs = start.getTime() - now.getTime();

  if (diffMs <= 0) return "agora";

  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return diffHours === 1 ? "em 1 hora" : `em ${diffHours} horas`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "em 1 dia" : `em ${diffDays} dias`;
}

export function formatUpNextSchedule(event: AgendaEvent): string {
  return formatEventTimeRange(event.startTime, event.endTime);
}

export function computeCategoryProgress(count: number, max = 12): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((count / max) * 100));
}

export function resolveSessionRoleLabel(rawRole: unknown): string {
  if (typeof rawRole !== "string") return "Equipe VitalFit";

  const normalized = rawRole.toUpperCase();
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Administrador",
    TRAINER: "Personal Trainer",
    MEMBER: "Membro",
  };

  return labels[normalized] ?? "Equipe VitalFit";
}
