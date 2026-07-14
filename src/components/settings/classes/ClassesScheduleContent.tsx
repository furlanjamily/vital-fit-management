import { getClassSchedulesAction } from "@/app/(app)/settings/classes/actions";
import { ClassesScheduleContentClient } from "@/components/settings/classes/ClassesScheduleContentClient";

export async function ClassesScheduleContent() {
  const result = await getClassSchedulesAction();
  const schedules = result.success ? result.data : [];

  return (
    <ClassesScheduleContentClient
      initialSchedules={schedules}
      loadError={result.success ? null : result.error}
    />
  );
}
