"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  MoreVertical,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { createUserAction, updateUserAction } from "@/app/(app)/users/actions";
import {
  DangerButton,
  GhostButton,
  GlassButton,
  IconButton,
  OutlineButton,
  SolidButton,
} from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { ModalOverlay } from "@/components/common/modal/modal-overlay";
import { Table, type TableColumn } from "@/components/common/table/table";
import { UserAvatar } from "@/components/users/UserAvatar";
import { UserForm } from "@/components/users/UserForm";
import {
  roleLabels,
  type ManagedUser,
  type UserFormValues,
} from "@/components/users/users.types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

type UsersContentProps = {
  initialUsers: ManagedUser[];
  loadError?: string | null;
};

type RowActionsProps = {
  user: ManagedUser;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRequestRemove: () => void;
};

function RowActions({ user, onEdit, onToggleStatus, onRequestRemove }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const isActive = user.status === "active";

  const items = [
    {
      label: "Editar",
      icon: Edit3,
      onClick: onEdit,
      className: "text-white/75 hover:text-white",
    },
    {
      label: isActive ? "Desativar" : "Reativar",
      icon: isActive ? UserMinus : UserCheck,
      onClick: onToggleStatus,
      className: "text-white/75 hover:text-white",
    },
    {
      label: "Remover",
      icon: Trash2,
      onClick: onRequestRemove,
      className: "text-red-300/85 hover:text-red-200",
    },
  ];

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <IconButton
        aria-label={`Ações para ${user.name}`}
        className="bg-white/7 text-white/70 hover:bg-white/13 hover:text-white"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreVertical className="size-3.5" />
      </IconButton>

      {open && (
        <GlassPanel
          variant="strong"
          intensity="medium"
          elevation="modal"
          className="absolute right-0 top-10 z-30 w-40 rounded-xl bg-[#221d17]/92 p-1.5"
        >
          {items.map((item) => (
            <GhostButton
              key={item.label}
              className={cn(
                "w-full justify-start gap-2.5 px-3 py-2 text-left",
                item.className,
              )}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </GhostButton>
          ))}
        </GlassPanel>
      )}
    </div>
  );
}

type ConfirmRemoveModalProps = {
  user: ManagedUser;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmRemoveModal({ user, onConfirm, onCancel }: ConfirmRemoveModalProps) {
  return (
    <ModalOverlay>
      <GlassPanel
        variant="strong"
        intensity="medium"
        elevation="modal"
        className="w-full max-w-sm rounded-2xl bg-[#221d17]/94 p-6"
      >
        <p className="text-sm font-semibold text-white">Remover usuário</p>
        <p className="mt-2 text-xs leading-relaxed text-white/48">
          Tem certeza que deseja remover{" "}
          <span className="font-semibold text-white/85">{user.name}</span>? Esta ação não
          pode ser desfeita.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <OutlineButton onClick={onCancel}>Cancelar</OutlineButton>
          <DangerButton leftIcon={<Trash2 className="size-3.5" />} onClick={onConfirm}>
            Remover
          </DangerButton>
        </div>
      </GlassPanel>
    </ModalOverlay>
  );
}

export function UsersContent({ initialUsers, loadError = null }: UsersContentProps) {
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

  async function handleSubmit(values: UserFormValues) {
    if (editingUser) {
      setSaving(true);
      setFormError(null);

      const result = await updateUserAction({
        id: editingUser.id,
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
        password: values.password.trim() || undefined,
      });

      setSaving(false);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      if ("simulated" in result && result.simulated) {
        setFormError(
          "Configure SUPABASE_SERVICE_ROLE_KEY no .env para persistir alterações.",
        );
        return;
      }

      if (!("user" in result)) return;

      const updatedUser: ManagedUser = {
        ...result.user,
        avatarUrl: values.avatarUrl,
      };

      setUsers((current) =>
        current.map((user) => (user.id === editingUser.id ? updatedUser : user)),
      );

      if ("isCurrentUser" in result && result.isCurrentUser) {
        const supabase = createClient();
        await supabase.auth.refreshSession();
        router.refresh();
      }

      closeForm();
      return;
    }

    setSaving(true);
    setFormError(null);

    const result = await createUserAction({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
    });

    setSaving(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    if ("simulated" in result && result.simulated) {
      setFormError(
        "Configure SUPABASE_SERVICE_ROLE_KEY no .env para persistir alterações.",
      );
      return;
    }

    if (!("user" in result)) return;

    setUsers((current) => [
      ...current,
      { ...result.user, avatarUrl: values.avatarUrl },
    ]);
    closeForm();
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

  const columns: TableColumn<ManagedUser>[] = [
    {
      key: "name",
      header: "Usuário",
      width: "42%",
      searchValue: (user) => `${user.name} ${user.email}`,
      render: (user) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            className="size-8"
            textClassName="text-[10px]"
          />
          <div>
            <p className="text-xs font-semibold text-white">{user.name}</p>
            <p className="text-[10px] text-white/35">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Permissão",
      width: "24%",
      searchValue: (user) => roleLabels[user.role],
      render: (user) => (
        <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[10px] font-medium text-white/65">
          {roleLabels[user.role]}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "22%",
      searchValue: (user) => (user.status === "active" ? "Ativo" : "Inativo"),
      render: (user) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
            user.status === "active"
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              : "border-white/12 bg-white/6 text-white/45",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              user.status === "active" ? "bg-emerald-400" : "bg-white/35",
            )}
          />
          {user.status === "active" ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "3rem",
      headerClassName: "w-12",
      className: "w-12",
      render: (user) => (
        <RowActions
          user={user}
          onEdit={() => openEditForm(user)}
          onToggleStatus={() => toggleStatus(user.id)}
          onRequestRemove={() => setRemovingUser(user)}
        />
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.72rem] font-semibold tracking-[-0.055em] text-white">
            Gestão de Usuários
          </h1>
          <p className="mt-1 text-sm text-white/48">
            Cadastre e gerencie os acessos ao sistema
          </p>
        </div>

        <GlassButton variant="subtle" size="md" rightIcon={<UserPlus className="size-4" />} onClick={openCreateForm}>
          Novo Usuário
        </GlassButton>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200/90"
        >
          {loadError}
        </p>
      ) : null}

      <Table
        data={users}
        columns={columns}
        getRowId={(user) => user.id}
        title="Todos os usuários"
        searchPlaceholder="Buscar por nome, e-mail..."
        emptyMessage="Nenhum usuário encontrado."
        rowClassName={(user) => (user.status === "inactive" ? "opacity-50" : undefined)}
        className="min-h-0 flex-1"
      />

      {formOpen && (
        <ModalOverlay scrollable>
          <UserForm
            key={editingUser?.id ?? "new"}
            editingUser={editingUser}
            submitting={saving}
            errorMessage={formError}
            onSubmit={handleSubmit}
            onCancelEdit={closeForm}
          />
        </ModalOverlay>
      )}

      {removingUser && (
        <ConfirmRemoveModal
          user={removingUser}
          onConfirm={() => removeUser(removingUser.id)}
          onCancel={() => setRemovingUser(null)}
        />
      )}
    </div>
  );
}
