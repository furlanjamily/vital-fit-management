"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { CirclePlus, Plus } from "lucide-react";
import { deleteAgendaEventAction } from "@/app/(app)/agenda/actions";
import { dispatchAgendaChanged } from "@/components/agenda/agenda-events";
import { toIsoDate } from "@/components/classes/class-schedule.helpers";
import { CollaborativeCalendar } from "@/components/agenda/CollaborativeCalendar";
import { EventDetailModal } from "@/components/agenda/EventDetailModal";
import { EventModal, padHour } from "@/components/agenda/EventModal";
import { formatEventSubject } from "@/components/agenda/agenda.helpers";
import type { AgendaEvent, AgendaUserOption } from "@/components/agenda/agenda.types";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassButton } from "@/components/common/form";
import { ConfirmRemoveDialog } from "@/components/common/modal/ConfirmRemoveDialog";
import { useCollaborativeAgenda } from "@/hooks/useCollaborativeAgenda";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type AgendaContentClientProps = {
  initialEvents: AgendaEvent[];
  userOptions: AgendaUserOption[];
  loadError?: string | null;
};

type ModalDefaults = {
  date: string;
  startTime: string;
  endTime: string;
};

export function AgendaContentClient({
  initialEvents,
  userOptions,
  loadError = null,
}: AgendaContentClientProps) {
  const {
    viewMode,
    setViewMode,
    referenceDate,
    setReferenceDate,
    events,
    loadError: scheduleError,
    isLoading,
    refreshEvents,
  } = useCollaborativeAgenda({ initialEvents });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [removingEvent, setRemovingEvent] = useState<AgendaEvent | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [modalDefaults, setModalDefaults] = useState<ModalDefaults>(() => ({
    date: toIsoDate(new Date()),
    startTime: "09:00",
    endTime: "10:00",
  }));

  const errorMessage = loadError ?? scheduleError ?? actionError;

  const sortedEvents = useMemo(
    () => [...events].sort((left, right) => left.startTime.localeCompare(right.startTime)),
    [events],
  );

  function openCreateModal(defaults?: Partial<ModalDefaults>) {
    setModalDefaults({
      date: defaults?.date ?? toIsoDate(referenceDate),
      startTime: defaults?.startTime ?? "09:00",
      endTime: defaults?.endTime ?? "10:00",
    });
    setModalOpen(true);
  }

  function handleCreateSlot(day: Date, hour: number) {
    openCreateModal({
      date: toIsoDate(day),
      startTime: padHour(hour),
      endTime: padHour(Math.min(hour + 1, 23)),
    });
  }

  const handleEventSelect = useCallback((event: AgendaEvent) => {
    setSelectedEvent(event);
    setActionError(null);
  }, []);

  const requestRemove = useCallback(() => {
    if (!selectedEvent) return;
    setRemovingEvent(selectedEvent);
  }, [selectedEvent]);

  const cancelRemove = useCallback(() => {
    if (isDeleting) return;
    setRemovingEvent(null);
  }, [isDeleting]);

  const confirmRemove = useCallback(() => {
    if (!removingEvent) return;

    startDeleteTransition(async () => {
      setActionError(null);

      const result = await deleteAgendaEventAction(removingEvent.id);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setRemovingEvent(null);
      setSelectedEvent(null);
      dispatchAgendaChanged({ reason: "delete" });
      refreshEvents();
    });
  }, [removingEvent, refreshEvents]);

  return (
    <div className="flex min-h-full w-full flex-col gap-6 lg:h-full lg:min-h-0">
      <div className="mb-2 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={glassTextStyles.pageTitle}>Agenda</h1>
          <p className={cn("mt-1 text-sm", glassText.muted)}>
            Reuniões, tarefas e eventos compartilhados com sua equipe.
          </p>
        </div>

        <GlassButton
          size="sm"
          variant="strong"
          className="self-end sm:self-auto"
          rightIcon={<CirclePlus className="size-4" aria-hidden="true" />}
          onClick={() => openCreateModal()}
        >
          Adicionar evento
        </GlassButton>
      </div>

      {errorMessage ? <InlineAlert className="shrink-0">{errorMessage}</InlineAlert> : null}

      <CollaborativeCalendar
        className="lg:min-h-0 lg:flex-1"
        events={sortedEvents}
        viewMode={viewMode}
        referenceDate={referenceDate}
        onViewModeChange={setViewMode}
        onReferenceDateChange={setReferenceDate}
        onCreateSlot={handleCreateSlot}
        onEventSelect={handleEventSelect}
        isLoading={isLoading || isDeleting}
      />

      {modalOpen ? (
        <EventModal
          userOptions={userOptions}
          defaultDate={modalDefaults.date}
          defaultStartTime={modalDefaults.startTime}
          defaultEndTime={modalDefaults.endTime}
          onClose={() => setModalOpen(false)}
          onSuccess={refreshEvents}
        />
      ) : null}

      {selectedEvent && !removingEvent ? (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={requestRemove}
        />
      ) : null}

      {removingEvent ? (
        <ConfirmRemoveDialog
          title="Excluir evento"
          subjectName={formatEventSubject(removingEvent)}
          pending={isDeleting}
          onConfirm={confirmRemove}
          onCancel={cancelRemove}
        />
      ) : null}
    </div>
  );
}
