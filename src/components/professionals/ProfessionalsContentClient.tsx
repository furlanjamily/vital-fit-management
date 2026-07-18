"use client";

import { Edit3, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { Button } from "@/components/common/button/Button";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
} from "@/components/common/table/Table";
import { TableIdentityCell } from "@/components/common/table/TableIdentityCell";
import { getTableTruncatedTextClassName } from "@/components/common/table/table.helpers";
import { ProfessionalRegistrationForm } from "@/components/professionals/ProfessionalRegistrationForm";
import { parseBirthDateToIso } from "@/components/professionals/professional.helpers";
import {
  shiftLabels,
  statusLabels,
  shiftOptions,
  type ManagedProfessional,
} from "@/components/professionals/professionals.types";
import { useProfessionalsManagement } from "@/components/professionals/useProfessionalsManagement";
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
    options: shiftOptions.map(({ value, label }) => ({ value, label })),
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
    <TableIdentityCell
      name={professional.name}
      subtitle={professional.email}
      avatarUrl={professional.avatarUrl}
    />
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
      {count} 
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
    actionError,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    toggleStatus,
  } = useProfessionalsManagement(initialProfessionals);

  function buildRowActions(professional: ManagedProfessional): RowAction[] {
    const isActive = professional.status === "active";

    return [
      {
        label: "Editar",
        icon: Edit3,
        disabled: !isActive,
        onSelect: () => openEditForm(professional),
      },
      {
        label: isActive ? "Inativar" : "Reativar",
        icon: isActive ? UserMinus : UserCheck,
        tone: isActive ? "default" : "accent",
        onSelect: () => toggleStatus(professional),
      },
    ];
  }

  const columns: TableColumn<ManagedProfessional>[] = [
    {
      key: "name",
      header: "Profissional",
      width: "32%",
      searchValue: (professional) =>
        `${professional.name} ${professional.email} ${professional.cref}`,
      render: (professional) => <ProfessionalIdentityCell professional={professional} />,
    },
    {
      key: "cref",
      header: "CREF",
      width: "16%",
      searchValue: (professional) => professional.cref,
      render: (professional) => (
        <span className={getTableTruncatedTextClassName()} title={professional.cref}>
          {professional.cref}
        </span>
      ),
    },
    {
      key: "specialty",
      header: "Especialidade",
      width: "20%",
      searchValue: (professional) => professional.specialty,
      render: (professional) => (
        <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[10px] font-medium text-orange-200">
          {professional.specialty}
        </span>
      ),
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
      width: "16%",
      searchValue: (professional) => statusLabels[professional.status],
      render: (professional) => <ProfessionalStatusBadge status={professional.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "4rem",
      headerClassName: "w-16",
      className: "w-16",
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
    <div className="flex min-h-full w-full flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="mb-2 flex flex-col gap-4 min-[425px]:flex-row min-[425px]:items-center min-[425px]:justify-between">
        <div>
          <h1 className={glassTextStyles.pageTitle}>Profissionais</h1>
          <p className={glassTextStyles.pageSubtitle}>
            Cadastre e gerencie os personal trainers da academia
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="lg"
          leftIcon={<UserPlus className="size-5" />}
          onClick={openCreateForm}
          className="self-start"
        >
          Profissional
        </Button>
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
          professional.status === "inactive"
            ? "[&>td:not(:last-child)]:opacity-50"
            : undefined
        }
        className="lg:min-h-0 lg:flex-1"
      />

      {formOpen && (
        <ProfessionalRegistrationForm
          key={editingProfessional?.id ?? "new"}
          editingProfessional={editingProfessional}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
        />
      )}

    </div>
  );
}
