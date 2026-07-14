import { notFound } from "next/navigation";
import {
  getClassBySlugAction,
  getClassGradeAction,
  listClassAppointmentsAction,
} from "@/app/(app)/classes/actions";
import { ClassScheduleContentClient } from "@/components/classes/ClassScheduleContentClient";
import { computeDateRange, toIsoDate } from "@/components/classes/class-schedule.helpers";

type ClassScheduleContentProps = {
  slug: string;
};

export async function ClassScheduleContent({ slug }: ClassScheduleContentProps) {
  const classResult = await getClassBySlugAction(slug);

  if (!classResult.success) {
    notFound();
  }

  const [gradeResult, appointmentsResult] = await Promise.all([
    getClassGradeAction(classResult.data.id),
    (async () => {
      const dateRange = computeDateRange(new Date(), "day");
      return listClassAppointmentsAction(
        slug,
        toIsoDate(dateRange.start),
        toIsoDate(dateRange.end),
      );
    })(),
  ]);

  const grade = gradeResult.success ? gradeResult.data : [];
  const initialAppointments = appointmentsResult.success ? appointmentsResult.data : [];
  const loadError = !appointmentsResult.success
    ? appointmentsResult.error
    : !gradeResult.success
      ? gradeResult.error
      : null;

  return (
    <ClassScheduleContentClient
      classRecord={classResult.data}
      slug={slug}
      grade={grade}
      initialAppointments={initialAppointments}
      loadError={loadError}
    />
  );
}
