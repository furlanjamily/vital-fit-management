"use client";

import { Edit3, Trash2, UserCheck, UserMinus, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/common/button/Button";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
} from "@/components/common/table/Table";
import { TableIdentityCell } from "@/components/common/table/TableIdentityCell";
import { MemberPaymentForm } from "@/components/members/MemberPaymentForm";
import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";
import { parseBirthDateToIso, getPaymentStatus } from "@/components/members/member.helpers";
import {
  originLabels,
  membershipPaymentLabels,
  planLabels,
  statusLabels,
  UNASSIGNED_PROFESSIONAL_VALUE,
  unassignedProfessionalLabel,
  type ManagedMember,
  type ProfessionalOption,
} from "@/components/members/members.types";
import { useMembersManagement } from "@/components/members/useMembersManagement";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { useToastOnError } from "@/hooks/useToastOnError";
import { cn } from "@/lib/cn";

type MembersContentClientProps = {
  initialMembers: ManagedMember[];
  professionalOptions: ProfessionalOption[];
  loadError?: string | null;
};

function membershipPaymentFilterValue(member: ManagedMember): "pending" | "current" {
  return getPaymentStatus(member.nextDueDate, member.paymentStatus) === "Em dia"
    ? "current"
    : "pending";
}

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
      type: "select",
      key: "paymentStatus",
      placeholder: "Mensalidade",
      options: [
        { value: "current", label: membershipPaymentLabels.current },
        { value: "pending", label: membershipPaymentLabels.pending },
      ],
      match: (member) => membershipPaymentFilterValue(member),
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
    <TableIdentityCell
      name={member.name}
      subtitle={member.email}
      avatarUrl={member.avatarUrl}
    />
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

function MemberPaymentBadge({ member }: { member: ManagedMember }) {
  const displayStatus = getPaymentStatus(member.nextDueDate, member.paymentStatus);
  const isCurrent = displayStatus === "Em dia";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isCurrent
          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
          : "border-amber-400/25 bg-amber-400/10 text-amber-200/90",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", isCurrent ? "bg-emerald-400" : "bg-amber-400/80")}
      />
      {displayStatus}
    </span>
  );
}

function ProfessionalTrainerCell({ member }: { member: ManagedMember }) {
  if (!member.professionalName) {
    return <span className={glassText.muted}>Não atribuído</span>;
  }

  return <span className={glassText.secondary}>{member.professionalName}</span>;
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
    payingMember,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    handlePaymentSuccess,
    toggleStatus,
    removeMember,
    requestRemove,
    cancelRemove,
    openPaymentForm,
    closePaymentForm,
  } = useMembersManagement(initialMembers);

  useToastOnError(loadError);

  const memberFilters = buildMemberFilters(professionalOptions);

  function buildRowActions(member: ManagedMember): RowAction[] {
    const isActive = member.status === "active";
    const isPaymentCurrent =
      getPaymentStatus(member.nextDueDate, member.paymentStatus) === "Em dia";

    return [
      { label: "Editar", icon: Edit3, onSelect: () => openEditForm(member) },
      {
        label: isPaymentCurrent ? "Mensalidade em dia" : "Confirmar pagamento",
        icon: Wallet,
        disabled: isPaymentCurrent,
        onSelect: () => openPaymentForm(member),
      },
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
      width: "22%",
      minWidth: "220px",
      searchValue: (member) => `${member.name} ${member.email} ${member.cpf}`,
      render: (member) => <MemberIdentityCell member={member} />,
    },
    {
      key: "cpf",
      header: "CPF",
      width: "15%",
      minWidth: "140px",
      searchValue: (member) => member.cpf,
      render: (member) => member.cpf,
    },
    {
      key: "professional",
      header: "Personal Trainer",
      width: "16%",
      minWidth: "160px",
      searchValue: (member) => member.professionalName ?? "",
      render: (member) => <ProfessionalTrainerCell member={member} />,
    },
    {
      key: "origin",
      header: "Origem",
      width: "18%",
      minWidth: "140px",
      searchValue: (member) => originLabels[member.origin],
      render: (member) => (
        <span className={cn("inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1", glassTextStyles.badge)}>
          {originLabels[member.origin]}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      width: "15%",
      minWidth: "130px",
      searchValue: (member) => planLabels[member.plan],
      render: (member) => planLabels[member.plan],
    },
    {
      key: "paymentStatus",
      header: "Mensalidade",
      width: "18%",
      minWidth: "150px",
      searchValue: (member) =>
        getPaymentStatus(member.nextDueDate, member.paymentStatus),
      render: (member) => <MemberPaymentBadge member={member} />,
    },
    {
      key: "status",
      header: "Status",
      width: "18%",
      minWidth: "130px",
      searchValue: (member) => statusLabels[member.status],
      render: (member) => <MemberStatusBadge status={member.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "3rem",
      minWidth: "64px",
      sticky: "right",
      headerClassName: "w-16",
      className: "w-16",
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
    <div className="flex min-h-full w-full flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className={glassTextStyles.pageTitle}>Gestão de Alunos</h1>
          <p className={glassTextStyles.pageSubtitle}>
            Cadastre e gerencie as matrículas da academia
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          leftIcon={<UserPlus className="size-5" />}
          onClick={openCreateForm}
        >
          Novo Aluno
        </Button>
      </div>

      <Table
        data={members}
        columns={columns}
        getRowId={(member) => member.id}
        title="Todos os alunos"
        filters={memberFilters}
        emptyMessage="Nenhum aluno encontrado."
        rowClassName={(member) => (member.status === "inactive" ? "opacity-50" : undefined)}
        className="lg:min-h-0 lg:flex-1"
      />

      {formOpen && (
        <MemberRegistrationForm
          key={editingMember?.id ?? "new"}
          editingMember={editingMember}
          professionalOptions={professionalOptions}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
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

      {payingMember && (
        <MemberPaymentForm
          member={payingMember}
          onSuccess={handlePaymentSuccess}
          onCancel={closePaymentForm}
        />
      )}
    </div>
  );
}
