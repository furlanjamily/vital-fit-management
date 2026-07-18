"use client";

import { CirclePlus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { deleteAppointmentAction } from "@/app/(app)/classes/actions";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassButton } from "@/components/common/form";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import {
  Table,
  type TableColumn,
  type TableFilterDefinition,
} from "@/components/common/table/Table";
import { AgendaDateFilter } from "@/components/classes/AgendaDateFilter";
import { ClassGradeTooltip } from "@/components/classes/ClassGradeTooltip";
import { dispatchAppointmentsChanged } from "@/components/classes/appointments-events";
import { formatAgendaDayGroupLabel } from "@/components/classes/class-schedule.helpers";
import { useScheduleModal } from "@/components/classes/ScheduleModalProvider";
import { useClassSchedule } from "@/components/classes/useClassSchedule";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import type { ClassAppointment, ClassGradeSlot, ClassRecord } from "@/services/class-manager";

type ClassScheduleContentClientProps = {
  classRecord: ClassRecord;
  slug: string;
  grade: ClassGradeSlot[];
  initialAppointments: ClassAppointment[];
  loadError?: string | null;
};

const appointmentFilters: TableFilterDefinition<ClassAppointment>[] = [
  {
    type: "text",
    key: "search",
    placeholder: "Buscar por aluno ou professor…",
  },
  {
    type: "select",
    key: "status",
    placeholder: "Status",
    options: [{ value: "CONFIRMED", label: "Confirmado" }],
    match: (appointment) => appointment.status,
  },
];

function AppointmentStatusBadge({ status }: { status: ClassAppointment["status"] }) {
  const isConfirmed = status === "CONFIRMED";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isConfirmed
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-white/15 bg-white/6 text-glass-muted",
      )}
    >
      {isConfirmed ? "Confirmado" : "Cancelado"}
    </span>
  );
}

function formatAppointmentDate(dateIso: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

function formatAppointmentSubject(appointment: ClassAppointment): string {
  return `${appointment.memberName} — ${appointment.time} · ${formatAppointmentDate(appointment.date)}`;
}

export function ClassScheduleContentClient({
  classRecord,
  slug,
  grade,
  initialAppointments,
  loadError = null,
}: ClassScheduleContentClientProps) {
  const { openScheduleModal } = useScheduleModal();
  const {
    viewMode,
    setViewMode,
    referenceDate,
    setReferenceDate,
    appointments,
    loadError: scheduleError,
    isLoading,
  } = useClassSchedule({ slug, initialAppointments });

  const [removingAppointment, setRemovingAppointment] = useState<ClassAppointment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const isGroupedView = viewMode !== "day";
  const isBusy = isLoading || isDeleting;

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((left, right) => {
        const dateCompare = left.date.localeCompare(right.date);
        if (dateCompare !== 0) return dateCompare;
        return left.time.localeCompare(right.time);
      }),
    [appointments],
  );

  const requestRemove = useCallback((appointment: ClassAppointment) => {
    setRemovingAppointment(appointment);
    setActionError(null);
  }, []);

  const cancelRemove = useCallback(() => {
    if (isDeleting) return;
    setRemovingAppointment(null);
  }, [isDeleting]);

  const confirmRemove = useCallback(() => {
    if (!removingAppointment) return;

    startDeleteTransition(async () => {
      setActionError(null);

      const result = await deleteAppointmentAction(removingAppointment.id, slug);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      dispatchAppointmentsChanged();
      setRemovingAppointment(null);
    });
  }, [removingAppointment, slug]);

  const buildRowActions = useCallback(
    (appointment: ClassAppointment): RowAction[] => [
      {
        label: "Remover",
        icon: Trash2,
        tone: "danger",
        onSelect: () => requestRemove(appointment),
      },
    ],
    [requestRemove],
  );

  const columns = useMemo(() => {
    const baseColumns: TableColumn<ClassAppointment>[] = [
      {
        key: "id",
        header: "ID",
        width: "5rem",
        searchValue: (appointment) => appointment.id.slice(0, 8),
        render: (appointment) => (
          <span className={cn("font-mono text-xs", glassText.muted)}>
            {appointment.id.slice(0, 8).toUpperCase()}
          </span>
        ),
      },
      {
        key: "time",
        header: "Horário",
        width: "5.5rem",
        searchValue: (appointment) => appointment.time,
        render: (appointment) => (
          <span className={cn("font-mono text-sm", glassText.primary)}>{appointment.time}</span>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "8rem",
        searchValue: (appointment) => appointment.status,
        render: (appointment) => <AppointmentStatusBadge status={appointment.status} />,
      },
      {
        key: "memberName",
        header: "Aluno",
        searchValue: (appointment) => appointment.memberName,
        render: (appointment) => (
          <span className={glassTextStyles.entityName}>{appointment.memberName}</span>
        ),
      },
      {
        key: "instructor",
        header: "Professor",
        searchValue: (appointment) => appointment.instructor,
        render: (appointment) => (
          <span className={cn("text-sm", glassText.secondary)}>{appointment.instructor}</span>
        ),
      },
    ];

    if (!isGroupedView) {
      baseColumns.push({
        key: "date",
        header: "Data",
        searchValue: (appointment) => appointment.date,
        render: (appointment) => (
          <span className={cn("text-sm capitalize", glassText.muted)}>
            {formatAppointmentDate(appointment.date)}
          </span>
        ),
      });
    }

    baseColumns.push({
      key: "actions",
      header: "",
      align: "right",
      width: "4rem",
      headerClassName: "w-16",
      className: "w-16",
      render: (appointment) => (
        <RowActionsMenu
          ariaLabel={`Ações do agendamento de ${appointment.memberName}`}
          disabled={isBusy}
          actions={buildRowActions(appointment)}
        />
      ),
    });

    return baseColumns;
  }, [buildRowActions, isBusy, isGroupedView]);

  const errorMessage = loadError ?? scheduleError ?? actionError;

  return (
    <div className="flex min-h-full w-full flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex gap-4">
          <ClassGradeTooltip grade={grade} />
          <h1 className={glassTextStyles.pageTitle}>{classRecord.name}
          </h1>
          </div>
            
          <p className={cn("mt-1 text-sm", glassText.muted)}>
            {classRecord.description ?? "Agendamentos e reservas da modalidade"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <GlassButton
            size="sm"
            rightIcon={<CirclePlus className="size-4" aria-hidden="true" />}
            onClick={() =>
              openScheduleModal({ defaultClassId: classRecord.id, slug })
            }
          >
            Agendar
          </GlassButton>
        </div>
      </div>

      {errorMessage ? <InlineAlert className="shrink-0">{errorMessage}</InlineAlert> : null}

      <Table
        data={sortedAppointments}
        columns={columns}
        getRowId={(appointment) => appointment.id}
        filters={appointmentFilters}
        emptyMessage="Nenhum agendamento encontrado para o período selecionado."
        className={cn("lg:min-h-0 lg:flex-1", isBusy && "pointer-events-none opacity-70")}
        groupBy={
          isGroupedView
            ? {
              key: (appointment) => appointment.date,
              renderHeader: formatAgendaDayGroupLabel,
            }
            : undefined
        }
        filterAccessory={
          <AgendaDateFilter
            viewMode={viewMode}
            referenceDate={referenceDate}
            onViewModeChange={setViewMode}
            onReferenceDateChange={setReferenceDate}
          />
        }
      />

      {removingAppointment ? (
        <ConfirmRemoveDialog
          title="Remover agendamento"
          subjectName={formatAppointmentSubject(removingAppointment)}
          pending={isDeleting}
          onConfirm={confirmRemove}
          onCancel={cancelRemove}
        />
      ) : null}
    </div>
  );
}
