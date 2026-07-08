"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProfessionalAction,
  updateProfessionalStatusAction,
} from "@/app/(app)/professionals/actions";
import type { ManagedProfessional } from "@/components/professionals/professionals.types";

export function useProfessionalsManagement(initialProfessionals: ManagedProfessional[]) {
  const router = useRouter();
  const [professionals, setProfessionals] = useState(initialProfessionals);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<ManagedProfessional | null>(
    null,
  );
  const [removingProfessional, setRemovingProfessional] =
    useState<ManagedProfessional | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingProfessional(null);
    setActionError(null);
    setFormOpen(true);
  }

  function openEditForm(professional: ManagedProfessional) {
    setEditingProfessional(professional);
    setActionError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingProfessional(null);
    setActionError(null);
  }

  function handleFormSuccess(professional: ManagedProfessional) {
    setProfessionals((current) =>
      editingProfessional
        ? current.map((item) =>
            item.id === professional.id
              ? { ...professional, memberCount: item.memberCount }
              : item,
          )
        : [professional, ...current],
    );

    closeForm();
    router.refresh();
  }

  function toggleStatus(professional: ManagedProfessional) {
    const nextActive = professional.status !== "active";

    startTransition(async () => {
      setActionError(null);

      const result = await updateProfessionalStatusAction(professional.id, nextActive);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setProfessionals((current) =>
        current.map((item) => (item.id === professional.id ? result.data : item)),
      );
      router.refresh();
    });
  }

  function removeProfessional(professionalId: string) {
    startTransition(async () => {
      setActionError(null);

      const result = await deleteProfessionalAction(professionalId);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setProfessionals((current) =>
        current.filter((professional) => professional.id !== professionalId),
      );
      if (editingProfessional?.id === professionalId) closeForm();
      setRemovingProfessional(null);
      router.refresh();
    });
  }

  return {
    professionals,
    formOpen,
    editingProfessional,
    removingProfessional,
    actionError,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    toggleStatus,
    removeProfessional,
    requestRemove: setRemovingProfessional,
    cancelRemove: () => setRemovingProfessional(null),
  };
}
