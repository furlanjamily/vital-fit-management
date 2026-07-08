"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAction, updateUserAction } from "@/app/(app)/users/actions";
import type { ManagedUser, UserFormValues } from "@/components/users/users.types";
import { createClient } from "@/lib/supabase/client";

const SIMULATED_MODE_MESSAGE =
  "Configure SUPABASE_SERVICE_ROLE_KEY no .env para persistir alterações.";

export function useUsersManagement(initialUsers: ManagedUser[]) {
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [removingUser, setRemovingUser] = useState<ManagedUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreateForm() {
    setEditingUser(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(user: ManagedUser) {
    setEditingUser(user);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingUser(null);
    setFormError(null);
  }

  async function refreshCurrentUserSession() {
    const supabase = createClient();
    await supabase.auth.refreshSession();
    router.refresh();
  }

  async function updateUser(editing: ManagedUser, values: UserFormValues) {
    const result = await updateUserAction({
      id: editing.id,
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      password: values.password.trim() || undefined,
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    if (!result.data.persisted) {
      setFormError(SIMULATED_MODE_MESSAGE);
      return;
    }

    const updatedUser: ManagedUser = { ...result.data.user, avatarUrl: values.avatarUrl };
    setUsers((current) =>
      current.map((user) => (user.id === editing.id ? updatedUser : user)),
    );

    if (result.data.isCurrentUser) {
      await refreshCurrentUserSession();
    }

    closeForm();
  }

  async function createUser(values: UserFormValues) {
    const result = await createUserAction({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    if (!result.data.persisted) {
      setFormError(SIMULATED_MODE_MESSAGE);
      return;
    }

    const createdUser: ManagedUser = { ...result.data.user, avatarUrl: values.avatarUrl };
    setUsers((current) => [...current, createdUser]);
    closeForm();
  }

  async function handleSubmit(values: UserFormValues) {
    setSaving(true);
    setFormError(null);

    try {
      if (editingUser) {
        await updateUser(editingUser, values);
        return;
      }

      await createUser(values);
    } finally {
      setSaving(false);
    }
  }

  function toggleStatus(userId: string) {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "inactive" : "active" }
          : user,
      ),
    );
  }

  function removeUser(userId: string) {
    setUsers((current) => current.filter((user) => user.id !== userId));
    if (editingUser?.id === userId) closeForm();
    setRemovingUser(null);
  }

  return {
    users,
    formOpen,
    editingUser,
    removingUser,
    saving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    toggleStatus,
    removeUser,
    requestRemove: setRemovingUser,
    cancelRemove: () => setRemovingUser(null),
  };
}
