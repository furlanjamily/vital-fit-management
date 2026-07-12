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
import { ProfessionalRegistrationForm } from "@/components/professionals/ProfessionalRegistrationForm";
import { parseBirthDateToIso } from "@/components/professionals/professional.helpers";
import {
  shiftLabels,
  statusLabels,
  type ManagedProfessional,
} from "@/components/professionals/professionals.types";
import { useProfessionalsManagement } from "@/components/professionals/useProfessionalsManagement";
import { UserAvatar } from "@/components/users/UserAvatar";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type ProfessionalsContentClientProps = {
  initialProfessionals: ManagedProfessional[];
  loadError?: string | null;
};

const professionalFilters: TableFilterDefinition<ManagedProfessional>[] = [
  {
    type: "text",
    key: "search",
    placeholder: "Buscar por nome, e-mail, CREF...",
  },
  {
    type: "select",
    key: "status",
    placeholder: "Status",
    options: [
      { value: "active", label: statusLabels.active },
      { value: "inactive", label: statusLabels.inactive },
    ],
    match: (professional) => professional.status,
  },
  {
    type: "select",
    key: "shift",
    placeholder: "Turno",
    options: [
      { value: "Morning", label: shiftLabels.Morning },
      { value: "Afternoon", label: shiftLabels.Afternoon },
      { value: "Night", label: shiftLabels.Night },
    ],
    match: (professional) => professional.shift,
  },
  {
    type: "date",
    key: "birthDate",
    placeholder: "dd / mm / aaaa",
    match: (professional) => parseBirthDateToIso(professional.birthDate) ?? "",
  },
];

function ProfessionalIdentityCell({ professional }: { professional: ManagedProfessional }) {
  return (
    <div className="flex items-center gap-2.5">
      <UserAvatar
        name={professional.name}
        avatarUrl={professional.avatarUrl}
        className="size-8"
        textClassName="text-[10px]"
      />
      <div>
        <p className={glassTextStyles.entityName}>{professional.name}</p>
        <p className={glassTextStyles.entityEmail}>{professional.email}</p>
      </div>
    </div>
  );
}

function ProfessionalStatusBadge({ status }: { status: ManagedProfessional["status"] }) {
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

function MemberCountBadge({ count }: { count: number }) {
  return (
    <span className={cn("inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1", glassTextStyles.badge)}>
      {count} {count === 1 ? "aluno" : "alunos"}
    </span>
  );
}

export function ProfessionalsContentClient({
  initialProfessionals,
  loadError = null,
}: ProfessionalsContentClientProps) {
  const {
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
    requestRemove,
    cancelRemove,
  } = useProfessionalsManagement(initialProfessionals);

  function buildRowActions(professional: ManagedProfessional): RowAction[] {
    const isActive = professional.status === "active";

    return [
      { label: "Editar", icon: Edit3, onSelect: () => openEditForm(professional) },
      {
        label: isActive ? "Inativar" : "Reativar",
        icon: isActive ? UserMinus : UserCheck,
        onSelect: () => toggleStatus(professional),
      },
      {
        label: "Remover",
        icon: Trash2,
        tone: "danger",
        onSelect: () => requestRemove(professional),
      },
    ];
  }

  const columns: TableColumn<ManagedProfessional>[] = [
    {
      key: "name",
      header: "Profissional",
      width: "30%",
      searchValue: (professional) =>
        `${professional.name} ${professional.email} ${professional.cref}`,
      render: (professional) => <ProfessionalIdentityCell professional={professional} />,
    },
    {
      key: "cref",
      header: "CREF",
      width: "18%",
      searchValue: (professional) => professional.cref,
      render: (professional) => professional.cref,
    },
    {
      key: "shift",
      header: "Turno",
      width: "16%",
      searchValue: (professional) => shiftLabels[professional.shift],
      render: (professional) => (
        <span className={cn("inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1", glassTextStyles.badge)}>
          {shiftLabels[professional.shift]}
        </span>
      ),
    },
    {
      key: "memberCount",
      header: "Alunos",
      width: "14%",
      searchValue: (professional) => String(professional.memberCount),
      render: (professional) => <MemberCountBadge count={professional.memberCount} />,
    },
    {
      key: "status",
      header: "Status",
      width: "14%",
      searchValue: (professional) => statusLabels[professional.status],
      render: (professional) => <ProfessionalStatusBadge status={professional.status} />,
    },
    {
      key: "actions",
      header: "",
      width: "3rem",
      headerClassName: "w-12",
      className: "w-12",
      render: (professional) => (
        <RowActionsMenu
          ariaLabel={`Ações para ${professional.name}`}
          disabled={isPending}
          actions={buildRowActions(professional)}
        />
      ),
    },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className={glassTextStyles.pageTitle}>Gestão de Profissionais</h1>
          <p className={glassTextStyles.pageSubtitle}>
            Cadastre e gerencie os personal trainers da academia
          </p>
        </div>

        <GlassButton
          variant="subtle"
          size="sm"
          rightIcon={<UserPlus className="size-3" />}
          onClick={openCreateForm}
        >
          Novo Profissional
        </GlassButton>
      </div>

      {loadError ? <InlineAlert>{loadError}</InlineAlert> : null}
      {actionError ? <InlineAlert>{actionError}</InlineAlert> : null}

      <Table
        data={professionals}
        columns={columns}
        getRowId={(professional) => professional.id}
        title="Todos os profissionais"
        filters={professionalFilters}
        emptyMessage="Nenhum profissional encontrado."
        rowClassName={(professional) =>
          professional.status === "inactive" ? "opacity-50" : undefined
        }
        className="min-h-0 flex-1"
      />

      {formOpen && (
        <ModalOverlay scrollable>
          <ProfessionalRegistrationForm
            key={editingProfessional?.id ?? "new"}
            editingProfessional={editingProfessional}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        </ModalOverlay>
      )}

      {removingProfessional && (
        <ConfirmRemoveDialog
          title="Remover profissional"
          subjectName={removingProfessional.name}
          pending={isPending}
          onConfirm={() => removeProfessional(removingProfessional.id)}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}
