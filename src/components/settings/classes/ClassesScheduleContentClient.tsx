"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassButton } from "@/components/common/form";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
} from "@/components/common/table/Table";
import { ScheduleForm } from "@/components/settings/classes/ScheduleForm";
import { useScheduleManagement } from "@/components/settings/classes/useScheduleManagement";
import {
  weekdayLabels,
  type ClassSchedule,
} from "@/components/settings/classes/schedule.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type ClassesScheduleContentClientProps = {
  initialSchedules: ClassSchedule[];
  loadError?: string | null;
};

const scheduleFilters: TableFilterDefinition<ClassSchedule>[] = [
  {
    type: "text",
    key: "search",
    placeholder: "Buscar por aula ou professor…",
  },
  {
    type: "select",
    key: "dayOfWeek",
    placeholder: "Dia da semana",
    options: Object.entries(weekdayLabels).map(([value, label]) => ({ value, label })),
    match: (schedule) => String(schedule.dayOfWeek),
  },
];

function ClassNameBadge({ name }: { name: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-orange-400/25 bg-orange-400/10 px-2.5 py-1 text-[10px] font-medium text-orange-200",
      )}
    >
      {name}
    </span>
  );
}

function ProfessionalSpecialtyBadge({ specialty }: { specialty: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[10px] font-medium",
        glassText.muted,
      )}
    >
      {specialty}
    </span>
  );
}

function ProfessionalCell({
  name,
  specialty,
}: {
  name: string;
  specialty: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={glassTextStyles.entityName}>{name}</span>
      <ProfessionalSpecialtyBadge specialty={specialty} />
    </div>
  );
}

export function ClassesScheduleContentClient({
  initialSchedules,
  loadError = null,
}: ClassesScheduleContentClientProps) {
  const {
    schedules,
    formOpen,
    editingSchedule,
    removingSchedule,
    actionError,
    isPending,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormSuccess,
    removeSchedule,
    requestRemove,
    cancelRemove,
    createClassScheduleAction,
    updateClassScheduleAction,
  } = useScheduleManagement(initialSchedules);

  const columns: TableColumn<ClassSchedule>[] = [
    {
      key: "className",
      header: "Aula",
      searchValue: (schedule) => schedule.className,
      render: (schedule) => <ClassNameBadge name={schedule.className} />,
    },
    {
      key: "professionalName",
      header: "Professor",
      searchValue: (schedule) =>
        `${schedule.professionalName} ${schedule.professionalSpecialty}`,
      render: (schedule) => (
        <ProfessionalCell
          name={schedule.professionalName}
          specialty={schedule.professionalSpecialty}
        />
      ),
    },
    {
      key: "dayOfWeek",
      header: "Dia",
      searchValue: (schedule) => weekdayLabels[schedule.dayOfWeek] ?? "",
      render: (schedule) => (
        <span className={cn("text-sm", glassText.secondary)}>
          {weekdayLabels[schedule.dayOfWeek] ?? "—"}
        </span>
      ),
    },
    {
      key: "startTime",
      header: "Horário",
      searchValue: (schedule) => schedule.startTime,
      render: (schedule) => (
        <span className={cn("font-mono text-xs", glassText.muted)}>{schedule.startTime}</span>
      ),
    },
    {
      key: "maxCapacity",
      header: "Capacidade",
      searchValue: (schedule) => String(schedule.maxCapacity),
      render: (schedule) => (
        <span className={cn("text-sm", glassText.secondary)}>{schedule.maxCapacity}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "w-16",
      headerClassName: "w-16",
      width: "4rem",
      render: (schedule) => {
        const actions: RowAction[] = [
          {
            label: "Editar",
            icon: Edit3,
            onSelect: () => openEditForm(schedule),
          },
          {
            label: "Remover",
            icon: Trash2,
            tone: "danger",
            onSelect: () => requestRemove(schedule),
          },
        ];

        return (
          <RowActionsMenu
            ariaLabel={`Ações para ${schedule.className} às ${schedule.startTime}`}
            disabled={isPending}
            actions={actions}
          />
        );
      },
    },
  ];

  const errorMessage = loadError ?? actionError;

  return (
    <div className="flex min-h-full w-full flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/settings"
            className={cn(
              "mb-3 inline-flex items-center gap-1.5 text-sm transition hover:text-glass-primary",
              glassText.muted,
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar para configurações
          </Link>
          <h1 className={glassTextStyles.pageTitle}>Grade de Aulas</h1>
          <p className={cn("mt-1 text-sm", glassText.muted)}>
            Gerenciamento de horários, professores e capacidade das turmas
          </p>
        </div>

        <GlassButton
          size="sm"
          onClick={openCreateForm}
          rightIcon={<Plus className="size-4" aria-hidden="true" />}
        >
          Adicionar Aula
        </GlassButton>
      </div>

      {errorMessage ? <InlineAlert className="shrink-0">{errorMessage}</InlineAlert> : null}

      <Table
        data={schedules}
        columns={columns}
        getRowId={(schedule) => schedule.id}
        filters={scheduleFilters}
        emptyMessage="Nenhum horário cadastrado."
        className={cn("lg:min-h-0 lg:flex-1", isPending && "pointer-events-none opacity-70")}
      />

      {formOpen ? (
        <ScheduleForm
          editingSchedule={editingSchedule}
          onSuccess={handleFormSuccess}
          onCancel={closeForm}
          createAction={createClassScheduleAction}
          updateAction={updateClassScheduleAction}
        />
      ) : null}

      {removingSchedule ? (
        <ConfirmRemoveDialog
          title="Remover horário"
          subjectName={`${removingSchedule.className} — ${weekdayLabels[removingSchedule.dayOfWeek]} às ${removingSchedule.startTime}`}
          pending={isPending}
          onConfirm={() => removeSchedule(removingSchedule.id)}
          onCancel={cancelRemove}
        />
      ) : null}
    </div>
  );
}
