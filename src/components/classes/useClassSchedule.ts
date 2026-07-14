"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { listClassAppointmentsAction } from "@/app/(app)/classes/actions";
import {
  computeDateRange,
  toIsoDate,
  type AgendaViewMode,
} from "@/components/classes/class-schedule.helpers";
import { APPOINTMENTS_CHANGED_EVENT } from "@/components/classes/appointments-events";
import type { ClassAppointment } from "@/services/class-manager";

type UseClassScheduleOptions = {
  slug: string;
  initialAppointments: ClassAppointment[];
};

export function useClassSchedule({ slug, initialAppointments }: UseClassScheduleOptions) {
  const [viewMode, setViewMode] = useState<AgendaViewMode>("day");
  const [referenceDate, setReferenceDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const dateRange = useMemo(
    () => computeDateRange(referenceDate, viewMode),
    [referenceDate, viewMode],
  );

  const loadAppointments = useCallback(() => {
    startTransition(async () => {
      setLoadError(null);

      const result = await listClassAppointmentsAction(
        slug,
        toIsoDate(dateRange.start),
        toIsoDate(dateRange.end),
      );

      if (!result.success) {
        setLoadError(result.error);
        return;
      }

      setAppointments(result.data);
    });
  }, [slug, dateRange.start, dateRange.end]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    const handleAppointmentsChanged = () => loadAppointments();
    window.addEventListener(APPOINTMENTS_CHANGED_EVENT, handleAppointmentsChanged);
    return () =>
      window.removeEventListener(APPOINTMENTS_CHANGED_EVENT, handleAppointmentsChanged);
  }, [loadAppointments]);

  return {
    viewMode,
    setViewMode,
    referenceDate,
    setReferenceDate,
    dateRange,
    appointments,
    loadError,
    isLoading,
  };
}
