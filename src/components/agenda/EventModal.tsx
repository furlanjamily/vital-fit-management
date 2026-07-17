"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import {
  Calendar,
  Clock,
  Link2,
  MapPin,
  Tag,
} from "lucide-react";
import { createAgendaEventAction } from "@/app/(app)/agenda/actions";
import { dispatchAgendaChanged } from "@/components/agenda/agenda-events";
import { toIsoDate } from "@/components/classes/class-schedule.helpers";
import { GlassMultiSelect } from "@/components/agenda/GlassMultiSelect";
import { eventTypeOptions, type AgendaUserOption } from "@/components/agenda/agenda.types";
import type { CreateEventFormValues } from "@/components/agenda/event.schema";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  FormField,
  GlassButton,
  GlassInput,
  GlassSelect,
} from "@/components/common/form";
import { DatePicker } from "@/components/common/date-picker/DatePicker";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";

type EventModalProps = {
  userOptions: AgendaUserOption[];
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  onClose: () => void;
  onSuccess: () => void;
};

function buildDefaultValues(
  defaultDate?: string,
  defaultStartTime?: string,
  defaultEndTime?: string,
): CreateEventFormValues {
  return {
    title: "",
    description: "",
    date: defaultDate ?? toIsoDate(new Date()),
    startTime: defaultStartTime ?? "09:00",
    endTime: defaultEndTime ?? "10:00",
    type: "reuniao",
    meetingLink: "",
    location: "",
    participantIds: [],
  };
}

function padHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function EventModal({
  userOptions,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  onClose,
  onSuccess,
}: EventModalProps) {
  const [values, setValues] = useState<CreateEventFormValues>(() =>
    buildDefaultValues(defaultDate, defaultStartTime, defaultEndTime),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValues(buildDefaultValues(defaultDate, defaultStartTime, defaultEndTime));
    setErrorMessage(null);
  }, [defaultDate, defaultStartTime, defaultEndTime]);

  const showMeetingLink = values.type === "reuniao";

  const timeOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        value: padHour(hour),
        label: padHour(hour),
      })),
    [],
  );

  function updateField<K extends keyof CreateEventFormValues>(
    key: K,
    value: CreateEventFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await createAgendaEventAction(values);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      dispatchAgendaChanged({ event: result.data, reason: "create" });
      onSuccess();
      onClose();
    });
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      title="Novo evento"
      description="Preencha os detalhes e convide participantes."
      size="lg"
    >
      {errorMessage ? (
        <InlineAlert className="mb-4 shrink-0 text-xs">{errorMessage}</InlineAlert>
      ) : null}

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
        <div className="min-h-0 flex-1 space-y-4 pb-5">
            <FormField label="Título" htmlFor="event-title">
              <GlassInput
                id="event-title"
                value={values.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Ex.: Reunião com equipe"
                disabled={isPending}
                autoFocus
              />
            </FormField>

            <FormField label="Data" htmlFor="event-date">
              <DatePicker
                id="event-date"
                value={values.date}
                onChange={(value) => updateField("date", value)}
                disabled={isPending}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Início" htmlFor="event-start">
                <GlassSelect
                  id="event-start"
                  leftIcon={Clock}
                  options={timeOptions}
                  value={values.startTime}
                  onChange={(event) => updateField("startTime", event.target.value)}
                  disabled={isPending}
                />
              </FormField>

              <FormField label="Fim" htmlFor="event-end">
                <GlassSelect
                  id="event-end"
                  leftIcon={Clock}
                  options={timeOptions}
                  value={values.endTime}
                  onChange={(event) => updateField("endTime", event.target.value)}
                  disabled={isPending}
                />
              </FormField>
            </div>

            <FormField label="Tipo" htmlFor="event-type">
              <GlassSelect
                id="event-type"
                leftIcon={Tag}
                options={eventTypeOptions}
                value={values.type}
                onChange={(event) =>
                  updateField("type", event.target.value as CreateEventFormValues["type"])
                }
                disabled={isPending}
              />
            </FormField>

            {showMeetingLink ? (
              <FormField label="Link da reunião" htmlFor="event-link">
                <GlassInput
                  id="event-link"
                  leftIcon={Link2}
                  type="url"
                  value={values.meetingLink}
                  onChange={(event) => updateField("meetingLink", event.target.value)}
                  placeholder="https://meet.google.com/..."
                  disabled={isPending}
                />
              </FormField>
            ) : null}

            <FormField label="Local" htmlFor="event-location">
              <GlassInput
                id="event-location"
                leftIcon={MapPin}
                value={values.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Ex.: Sala 2 — Unidade Centro"
                disabled={isPending}
              />
            </FormField>

            <FormField label="Participantes">
              <GlassMultiSelect
                options={userOptions}
                value={values.participantIds}
                onChange={(participantIds) => updateField("participantIds", participantIds)}
                disabled={isPending}
                placement="top"
              />
            </FormField>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-white/10 pt-4 flex-row justify-end">
            <GlassButton
              variant="subtle"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </GlassButton>

            <GlassButton
              type="submit"
              size="sm"
              variant="strong"
              loading={isPending}
              leftIcon={isPending ? undefined : <Calendar className="size-4" />}
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isPending ? "Salvando…" : "Adicionar evento"}
            </GlassButton>
          </div>
        </form>
    </ResponsiveModal>
  );
}

export { padHour };
