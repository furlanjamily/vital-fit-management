"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMemberAction,
  updateMemberStatusAction,
} from "@/app/(app)/members/actions";
import type { ManagedMember } from "@/components/members/members.types";
import { toastError, toastSuccess } from "@/lib/toast-utils";

export function useMembersManagement(initialMembers: ManagedMember[]) {
  const router = useRouter();
  const [members, setMembers] = useState<ManagedMember[]>(initialMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ManagedMember | null>(null);
  const [removingMember, setRemovingMember] = useState<ManagedMember | null>(null);
  const [payingMember, setPayingMember] = useState<ManagedMember | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingMember(null);
    setFormOpen(true);
  }

  function openEditForm(member: ManagedMember) {
    setEditingMember(member);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMember(null);
  }

  function handleFormSuccess(member: ManagedMember) {
    setMembers((current) =>
      editingMember
        ? current.map((item) => (item.id === member.id ? member : item))
        : [member, ...current],
    );

    closeForm();
    router.refresh();
  }

  function toggleStatus(member: ManagedMember) {
    const nextActive = member.status !== "active";

    startTransition(async () => {
      const result = await updateMemberStatusAction(member.id, nextActive);

      if (!result.success) {
        toastError(result.error);
        return;
      }

      setMembers((current) =>
        current.map((item) => (item.id === member.id ? result.data : item)),
      );
      toastSuccess(
        nextActive ? "Aluno reativado com sucesso." : "Aluno desativado com sucesso.",
      );
      router.refresh();
    });
  }

  function removeMember(memberId: string) {
    startTransition(async () => {
      const result = await deleteMemberAction(memberId);

      if (!result.success) {
        toastError(result.error);
        return;
      }

      setMembers((current) => current.filter((member) => member.id !== memberId));
      if (editingMember?.id === memberId) closeForm();
      setRemovingMember(null);
      toastSuccess("Aluno removido com sucesso.");
      router.refresh();
    });
  }

  function handlePaymentSuccess(member: ManagedMember) {
    setMembers((current) =>
      current.map((item) => (item.id === member.id ? member : item)),
    );
    setPayingMember(null);
    router.refresh();
  }

  return {
    members,
    formOpen,
    editingMember,
    removingMember,
    payingMember,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    handlePaymentSuccess,
    toggleStatus,
    removeMember,
    requestRemove: setRemovingMember,
    cancelRemove: () => setRemovingMember(null),
    openPaymentForm: setPayingMember,
    closePaymentForm: () => setPayingMember(null),
  };
}
