"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { listAgendaEventsAction } from "@/app/(app)/agenda/actions";
import { AGENDA_CHANGED_EVENT } from "@/components/agenda/agenda-events";
import {
  computeDateRange,
  type AgendaViewMode,
} from "@/components/classes/class-schedule.helpers";
import type { AgendaEvent } from "@/components/agenda/agenda.types";

type UseCollaborativeAgendaOptions = {
  initialEvents: AgendaEvent[];
  initialReferenceDate?: Date;
  initialViewMode?: AgendaViewMode;
};

export function useCollaborativeAgenda({
  initialEvents,
  initialReferenceDate = new Date(),
  initialViewMode = "week",
}: UseCollaborativeAgendaOptions) {
  const [viewMode, setViewMode] = useState<AgendaViewMode>(initialViewMode);
  const [referenceDate, setReferenceDate] = useState(initialReferenceDate);
  const [events, setEvents] = useState(initialEvents);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, startTransition] = useTransition();

  const fetchRange = useMemo(() => {
    const { start, end } = computeDateRange(referenceDate, viewMode);
    return {
      rangeStart: start.toISOString(),
      rangeEnd: end.toISOString(),
    };
  }, [referenceDate, viewMode]);

  const refreshEvents = useCallback(() => {
    startTransition(async () => {
      setLoadError(null);

      const result = await listAgendaEventsAction(
        fetchRange.rangeStart,
        fetchRange.rangeEnd,
      );

      if (!result.success) {
        setLoadError(result.error);
        return;
      }

      setEvents(result.data);
    });
  }, [fetchRange.rangeEnd, fetchRange.rangeStart]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  useEffect(() => {
    const handler = () => refreshEvents();
    window.addEventListener(AGENDA_CHANGED_EVENT, handler);
    return () => window.removeEventListener(AGENDA_CHANGED_EVENT, handler);
  }, [refreshEvents]);

  return {
    viewMode,
    setViewMode,
    referenceDate,
    setReferenceDate,
    events,
    loadError,
    isLoading,
    refreshEvents,
  };
}
