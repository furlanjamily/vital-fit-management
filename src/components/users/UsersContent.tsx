"use client";

import { Edit3, Trash2, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassButton } from "@/components/common/form";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import { ModalOverlay } from "@/components/common/modal/ModalOverlay";
import { Table, type TableColumn } from "@/components/common/table/Table";
import { UserAvatar } from "@/components/users/UserAvatar";
import { UserForm } from "@/components/users/UserForm";
import { roleLabels, type ManagedUser } from "@/components/users/users.types";
import { useUsersManagement } from "@/components/users/useUsersManagement";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type UsersContentProps = {
  initialUsers: ManagedUser[];
  loadError?: string | null;
};

function UserIdentityCell({ user }: { user: ManagedUser }) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar
        name={user.name}
        avatarUrl={user.avatarUrl}
        className="size-8"
        textClassName="text-[10px]"
      />
      <div>
        <p className={glassTextStyles.entityName}>{user.name}</p>
        <p className={glassTextStyles.entityEmail}>{user.email}</p>
      </div>
    </div>
  );
}

function UserStatusBadge({ status }: { status: ManagedUser["status"] }) {
  const isActive = status === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isActive
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : cn("border-white/12 bg-white/6", glassText.muted),
      )}
    >
      <span className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-400" : "bg-white/35")} />
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}

export function UsersContent({ initialUsers, loadError = null }: UsersContentProps) {
  const {
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
    requestRemove,
    cancelRemove,
  } = useUsersManagement(initialUsers);

  function buildRowActions(user: ManagedUser): RowAction[] {
    const isActive = user.status === "active";

    return [
      { label: "Editar", icon: Edit3, onSelect: () => openEditForm(user) },
      {
        label: isActive ? "Desativar" : "Reativar",
        icon: isActive ? UserMinus : UserCheck,
        onSelect: () => toggleStatus(user.id),
      },
      {
        label: "Remover",
        icon: Trash2,
        tone: "danger",
        onSelect: () => requestRemove(user),
      },
    ];
  }

  const columns: TableColumn<ManagedUser>[] = [
    {
      key: "name",
      header: "Usuário",
      width: "42%",
      searchValue: (user) => `${user.name} ${user.email}`,
      render: (user) => <UserIdentityCell user={user} />,
    },
    {
      key: "role",
      header: "Permissão",
      width: "24%",
      searchValue: (user) => roleLabels[user.role],
      render: (user) => (
        <span className={cn("inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1", glassTextStyles.badge)}>
          {roleLabels[user.role]}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "22%",
      searchValue: (user) => (user.status === "active" ? "Ativo" : "Inativo"),
      render: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "4rem",
      headerClassName: "w-16",
      className: "w-16",
      render: (user) => (
        <RowActionsMenu
          ariaLabel={`Ações para ${user.name}`}
          actions={buildRowActions(user)}
        />
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className={glassTextStyles.pageTitle}>Gestão de Usuários</h1>
          <p className={glassTextStyles.pageSubtitle}>
            Cadastre e gerencie os acessos ao sistema
          </p>
        </div>

        <GlassButton
          variant="subtle"
          size="md"
          rightIcon={<UserPlus className="size-4" />}
          onClick={openCreateForm}
        >
          Novo Usuário
        </GlassButton>
      </div>

      {loadError ? <InlineAlert>{loadError}</InlineAlert> : null}

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
        <ConfirmRemoveDialog
          title="Remover usuário"
          subjectName={removingUser.name}
          onConfirm={() => removeUser(removingUser.id)}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}
