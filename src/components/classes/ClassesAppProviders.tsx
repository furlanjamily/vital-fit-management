import { getMembersAction } from "@/app/(app)/members/actions";
import { listClassesAction } from "@/app/(app)/classes/actions";
import { ScheduleModalProvider } from "@/components/classes/ScheduleModalProvider";
import type { ReactNode } from "react";

type ClassesAppProvidersProps = {
  children: ReactNode;
};

export async function ClassesAppProviders({ children }: ClassesAppProvidersProps) {
  const [classesResult, membersResult] = await Promise.all([
    listClassesAction(),
    getMembersAction(),
  ]);

  const classes = classesResult.success ? classesResult.data : [];
  const members = membersResult.success ? membersResult.data : [];

  return (
    <ScheduleModalProvider classes={classes} members={members}>
      {children}
    </ScheduleModalProvider>
  );
}
