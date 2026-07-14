export const AGENDA_CHANGED_EVENT = "vitalfit:agenda-changed";

export function dispatchAgendaChanged() {
  window.dispatchEvent(new CustomEvent(AGENDA_CHANGED_EVENT));
}
