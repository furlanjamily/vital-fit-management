export const APPOINTMENTS_CHANGED_EVENT = "vitalfit:appointments-changed";

export function dispatchAppointmentsChanged() {
  window.dispatchEvent(new CustomEvent(APPOINTMENTS_CHANGED_EVENT));
}
