"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createClassScheduleAction,
  deleteClassScheduleAction,
  updateClassScheduleAction,
} from "@/app/(app)/settings/classes/actions";
import type { ClassSchedule } from "@/components/settings/classes/schedule.types";
import { toastError, toastSuccess } from "@/lib/toast-utils";

function compareSchedules(a: ClassSchedule, b: ClassSchedule) {
  if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
  return a.startTime.localeCompare(b.startTime);
}

function upsertSchedule(current: ClassSchedule[], schedule: ClassSchedule) {
  const index = current.findIndex((item) => item.id === schedule.id);
  if (index === -1) return [...current, schedule].sort(compareSchedules);

  const next = [...current];
  next[index] = schedule;
  return next.sort(compareSchedules);
}

export function useScheduleManagement(initialSchedules: ClassSchedule[]) {
  const router = useRouter();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [removingSchedule, setRemovingSchedule] = useState<ClassSchedule | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingSchedule(null);
    setFormOpen(true);
  }

  function openEditForm(schedule: ClassSchedule) {
    setEditingSchedule(schedule);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingSchedule(null);
  }

  function handleFormSuccess(schedule: ClassSchedule) {
    setSchedules((current) => upsertSchedule(current, schedule));
    closeForm();

    startTransition(() => {
      router.refresh();
    });
  }

  function removeSchedule(scheduleId: string) {
    startTransition(async () => {
      const result = await deleteClassScheduleAction(scheduleId);

      if (!result.success) {
        toastError(result.error);
        return;
      }

      setSchedules((current) => current.filter((schedule) => schedule.id !== scheduleId));
      if (editingSchedule?.id === scheduleId) closeForm();
      setRemovingSchedule(null);
      toastSuccess("Horário removido com sucesso.");
      router.refresh();
    });
  }

  return {
    schedules,
    formOpen,
    editingSchedule,
    removingSchedule,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    removeSchedule,
    requestRemove: setRemovingSchedule,
    cancelRemove: () => setRemovingSchedule(null),
    createClassScheduleAction,
    updateClassScheduleAction,
  };
}
