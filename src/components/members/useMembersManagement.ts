"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMemberAction,
  updateMemberStatusAction,
} from "@/app/(app)/members/actions";
import type { ManagedMember } from "@/components/members/members.types";

export function useMembersManagement(initialMembers: ManagedMember[]) {
  const router = useRouter();
  const [members, setMembers] = useState<ManagedMember[]>(initialMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ManagedMember | null>(null);
  const [removingMember, setRemovingMember] = useState<ManagedMember | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingMember(null);
    setActionError(null);
    setFormOpen(true);
  }

  function openEditForm(member: ManagedMember) {
    setEditingMember(member);
    setActionError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMember(null);
    setActionError(null);
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
      setActionError(null);

      const result = await updateMemberStatusAction(member.id, nextActive);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setMembers((current) =>
        current.map((item) => (item.id === member.id ? result.data : item)),
      );
      router.refresh();
    });
  }

  function removeMember(memberId: string) {
    startTransition(async () => {
      setActionError(null);

      const result = await deleteMemberAction(memberId);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setMembers((current) => current.filter((member) => member.id !== memberId));
      if (editingMember?.id === memberId) closeForm();
      setRemovingMember(null);
      router.refresh();
    });
  }

  return {
    members,
    formOpen,
    editingMember,
    removingMember,
    actionError,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    toggleStatus,
    removeMember,
    requestRemove: setRemovingMember,
    cancelRemove: () => setRemovingMember(null),
  };
}
