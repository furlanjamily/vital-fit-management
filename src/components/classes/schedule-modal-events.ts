export const OPEN_SCHEDULE_MODAL_EVENT = "vitalfit:open-schedule-modal";

export type OpenScheduleModalDetail = {
  defaultClassId?: string | null;
  slug?: string;
};

export function dispatchOpenScheduleModal(detail?: OpenScheduleModalDetail) {
  window.dispatchEvent(
    new CustomEvent<OpenScheduleModalDetail>(OPEN_SCHEDULE_MODAL_EVENT, {
      detail: detail ?? {},
    }),
  );
}
