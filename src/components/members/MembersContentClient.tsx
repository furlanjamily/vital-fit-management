"use client";

import { Edit3, Trash2, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassButton } from "@/components/common/form";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import { ModalOverlay } from "@/components/common/modal/ModalOverlay";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
} from "@/components/common/table/Table";
import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";
import { parseBirthDateToIso } from "@/components/members/member.helpers";
import {
  originLabels,
  planLabels,
  statusLabels,
  UNASSIGNED_PROFESSIONAL_VALUE,
  unassignedProfessionalLabel,
  type ManagedMember,
  type ProfessionalOption,
} from "@/components/members/members.types";
import { useMembersManagement } from "@/components/members/useMembersManagement";
import { UserAvatar } from "@/components/users/UserAvatar";
import { cn } from "@/lib/cn";

type MembersContentClientProps = {
  initialMembers: ManagedMember[];
  professionalOptions: ProfessionalOption[];
  loadError?: string | null;
};

function buildMemberFilters(
  professionalOptions: ProfessionalOption[],
): TableFilterDefinition<ManagedMember>[] {
  return [
    {
      type: "text",
      key: "search",
      placeholder: "Buscar por nome, e-mail, CPF...",
    },
    {
      type: "select",
      key: "status",
      placeholder: "Status",
      options: [
        { value: "active", label: statusLabels.active },
        { value: "inactive", label: statusLabels.inactive },
      ],
      match: (member) => member.status,
    },
    {
      type: "select",
      key: "professionalId",
      placeholder: "Personal Trainer",
      options: [
        { value: UNASSIGNED_PROFESSIONAL_VALUE, label: unassignedProfessionalLabel },
        ...professionalOptions.map((professional) => ({
          value: professional.id,
          label: professional.name,
        })),
      ],
      match: (member) => member.professionalId ?? UNASSIGNED_PROFESSIONAL_VALUE,
    },
    {
      type: "date",
      key: "birthDate",
      placeholder: "dd / mm / aaaa",
      match: (member) => parseBirthDateToIso(member.birthDate) ?? "",
    },
  ];
}

function MemberIdentityCell({ member }: { member: ManagedMember }) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar
        name={member.name}
        avatarUrl={member.avatarUrl}
        className="size-8"
        textClassName="text-[10px]"
      />
      <div>
        <p className="text-xs font-semibold text-white">{member.name}</p>
        <p className="text-[10px] text-white/35">{member.email}</p>
      </div>
    </div>
  );
}

function MemberStatusBadge({ status }: { status: ManagedMember["status"] }) {
  const isActive = status === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isActive
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-red-400/20 bg-red-400/10 text-red-300/80",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-400" : "bg-red-400/70")}
      />
      {statusLabels[status]}
    </span>
  );
}

function ProfessionalTrainerCell({ member }: { member: ManagedMember }) {
  if (!member.professionalName) {
    return <span className="text-white/48">Não atribuído</span>;
  }

  return <span className="text-white/75">{member.professionalName}</span>;
}

export function MembersContentClient({
  initialMembers,
  professionalOptions,
  loadError = null,
}: MembersContentClientProps) {
  const {
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
    requestRemove,
    cancelRemove,
  } = useMembersManagement(initialMembers);

  const memberFilters = buildMemberFilters(professionalOptions);

  function buildRowActions(member: ManagedMember): RowAction[] {
    const isActive = member.status === "active";

    return [
      { label: "Editar", icon: Edit3, onSelect: () => openEditForm(member) },
      {
        label: isActive ? "Inativar" : "Reativar",
        icon: isActive ? UserMinus : UserCheck,
        onSelect: () => toggleStatus(member),
      },
      {
        label: "Remover",
        icon: Trash2,
        tone: "danger",
        onSelect: () => requestRemove(member),
      },
    ];
  }

  const columns: TableColumn<ManagedMember>[] = [
    {
      key: "name",
      header: "Aluno",
      width: "24%",
      searchValue: (member) => `${member.name} ${member.email} ${member.cpf}`,
      render: (member) => <MemberIdentityCell member={member} />,
    },
    {
      key: "cpf",
      header: "CPF",
      width: "13%",
      searchValue: (member) => member.cpf,
      render: (member) => member.cpf,
    },
    {
      key: "professional",
      header: "Personal Trainer",
      width: "16%",
      searchValue: (member) => member.professionalName ?? "",
      render: (member) => <ProfessionalTrainerCell member={member} />,
    },
    {
      key: "origin",
      header: "Origem",
      width: "14%",
      searchValue: (member) => originLabels[member.origin],
      render: (member) => (
        <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[10px] font-medium text-white/65">
          {originLabels[member.origin]}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      width: "13%",
      searchValue: (member) => planLabels[member.plan],
      render: (member) => planLabels[member.plan],
    },
    {
      key: "status",
      header: "Status",
      width: "12%",
      searchValue: (member) => statusLabels[member.status],
      render: (member) => <MemberStatusBadge status={member.status} />,
    },
    {
      key: "actions",
      header: "",
      width: "3rem",
      headerClassName: "w-12",
      className: "w-12",
      render: (member) => (
        <RowActionsMenu
          ariaLabel={`Ações para ${member.name}`}
          disabled={isPending}
          actions={buildRowActions(member)}
        />
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.72rem] font-semibold tracking-[-0.055em] text-white">
            Gestão de Alunos
          </h1>
          <p className="mt-1 text-sm text-white/48">
            Cadastre e gerencie as matrículas da academia
          </p>
        </div>

        <GlassButton
          variant="subtle"
          size="sm"
          rightIcon={<UserPlus className="size-3" />}
          onClick={openCreateForm}
        >
          Novo Aluno
        </GlassButton>
      </div>

      {loadError ? <InlineAlert>{loadError}</InlineAlert> : null}
      {actionError ? <InlineAlert>{actionError}</InlineAlert> : null}

      <Table
        data={members}
        columns={columns}
        getRowId={(member) => member.id}
        title="Todos os alunos"
        filters={memberFilters}
        emptyMessage="Nenhum aluno encontrado."
        rowClassName={(member) => (member.status === "inactive" ? "opacity-50" : undefined)}
        className="min-h-0 flex-1"
      />

      {formOpen && (
        <ModalOverlay scrollable>
          <MemberRegistrationForm
            key={editingMember?.id ?? "new"}
            editingMember={editingMember}
            professionalOptions={professionalOptions}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        </ModalOverlay>
      )}

      {removingMember && (
        <ConfirmRemoveDialog
          title="Remover aluno"
          subjectName={removingMember.name}
          pending={isPending}
          onConfirm={() => removeMember(removingMember.id)}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}
