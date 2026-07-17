"use client";

import { useEffect, useState, useTransition } from "react";
import { listClassesNavAction } from "@/app/(app)/classes/actions";
import { APPOINTMENTS_CHANGED_EVENT } from "@/components/classes/appointments-events";
import type { ClassNavEntry } from "@/services/class-manager";

type UseClassesNavItemsOptions = {
  /** Quando false, adia o fetch (ex.: drawer fechado). Default: true. */
  enabled?: boolean;
};

export function useClassesNavItems(options: UseClassesNavItemsOptions = {}) {
  const { enabled = true } = options;
  const [classItems, setClassItems] = useState<ClassNavEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) return;

    startTransition(async () => {
      const result = await listClassesNavAction();

      if (!result.success) {
        setLoadError(result.error);
        return;
      }

      setClassItems(result.data);
      setLoadError(null);
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleAppointmentsChanged = () => {
      startTransition(async () => {
        const result = await listClassesNavAction();
        if (result.success) setClassItems(result.data);
      });
    };

    window.addEventListener(APPOINTMENTS_CHANGED_EVENT, handleAppointmentsChanged);
    return () =>
      window.removeEventListener(APPOINTMENTS_CHANGED_EVENT, handleAppointmentsChanged);
  }, [enabled]);

  return { classItems, loadError, isPending };
}
