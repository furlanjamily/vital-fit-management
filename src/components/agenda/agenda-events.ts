import type { AgendaEvent } from "@/components/agenda/agenda.types";

export const AGENDA_CHANGED_EVENT = "vitalfit:agenda-changed";

export type AgendaChangedDetail = {
  /** Evento criado/atualizado — permite update otimista no sidebar. */
  event?: AgendaEvent;
  /** Motivo da mudança. */
  reason?: "create" | "delete" | "update";
};

export function dispatchAgendaChanged(detail?: AgendaChangedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AGENDA_CHANGED_EVENT, { detail }));
}
