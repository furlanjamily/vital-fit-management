"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { Clock, Loader2, User, X } from "lucide-react";
import {
  createAppointmentAction,
  getClassScheduleSlotsAction,
  getClassScheduleWeekdaysAction,
  validateClassSlotAction,
} from "@/app/(app)/classes/actions";
import { dispatchAppointmentsChanged } from "@/components/classes/appointments-events";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  FormField,
  GlassButton,
  GlassSelect,
  IconButton,
} from "@/components/common/form";
import { DatePicker } from "@/components/common/date-picker/DatePicker";
import { ModalOverlay } from "@/components/common/modal/ModalOverlay";
import { ModalPanel } from "@/components/common/modal/ModalPanel";
import {
  getDayOfWeekFromIso,
  toIsoDate,
} from "@/components/classes/class-schedule.helpers";
import {
  formatScheduleWeekdays,
  weekdayLabels,
} from "@/components/settings/classes/schedule.types";
import type { ManagedMember } from "@/components/members/members.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import type { AvailableClass, ClassRecord } from "@/services/class-manager";

type SubmitPhase = "idle" | "validating" | "confirming";

type ScheduleModalProps = {
  classes: ClassRecord[];
  members: ManagedMember[];
  defaultClassId: string | null;
  slug?: string;
  onClose: () => void;
  onSuccess: () => void;
};

function todayIso(): string {
  return toIsoDate(new Date());
}

export function ScheduleModal({
  classes,
  members,
  defaultClassId,
  slug,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const isClassLocked = Boolean(defaultClassId);
  const activeMembers = useMemo(
    () => members.filter((member) => member.status === "active"),
    [members],
  );

  const [classId, setClassId] = useState(defaultClassId ?? classes[0]?.id ?? "");
  const [memberId, setMemberId] = useState(activeMembers[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [scheduleId, setScheduleId] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailableClass[]>([]);
  const [gradeWeekdays, setGradeWeekdays] = useState<number[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [, startTransition] = useTransition();

  const classOptions = useMemo(
    () => classes.map((item) => ({ value: item.id, label: item.name })),
    [classes],
  );

  const memberOptions = useMemo(
    () => activeMembers.map((member) => ({ value: member.id, label: member.name })),
    [activeMembers],
  );

  const selectedDayOfWeek = useMemo(() => getDayOfWeekFromIso(date), [date]);
  const isGradeDay = gradeWeekdays.includes(selectedDayOfWeek);

  const slotOptions = useMemo(
    () =>
      availableSlots.map((slot) => ({
        value: slot.id,
        label:
          slot.remainingSlots > 0
            ? `${slot.time} — ${slot.instructor} (${slot.remainingSlots}/${slot.totalSlots} vagas)`
            : `${slot.time} — ${slot.instructor} (Esgotado)`,
        disabled: slot.remainingSlots <= 0,
      })),
    [availableSlots],
  );

  const bookableSlotOptions = slotOptions.filter((slot) => !slot.disabled);

  useEffect(() => {
    setClassId(defaultClassId ?? classes[0]?.id ?? "");
    setDate(todayIso());
    setScheduleId("");
    setErrorMessage(null);
  }, [defaultClassId, classes]);

  useEffect(() => {
    if (!classId) {
      setGradeWeekdays([]);
      return;
    }

    let cancelled = false;

    startTransition(async () => {
      const result = await getClassScheduleWeekdaysAction(classId);
      if (cancelled) return;

      if (result.success) {
        setGradeWeekdays(result.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [classId]);

  useEffect(() => {
    if (!classId || !date) {
      setAvailableSlots([]);
      setScheduleId("");
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await getClassScheduleSlotsAction(classId, date);

      if (cancelled) return;

      setSlotsLoading(false);

      if (!result.success) {
        setAvailableSlots([]);
        setScheduleId("");
        setErrorMessage(result.error);
        return;
      }

      setAvailableSlots(result.data);
      setScheduleId((current) => {
        const bookable = result.data.filter((slot) => slot.remainingSlots > 0);
        if (current && bookable.some((slot) => slot.id === current)) {
          return current;
        }
        return bookable[0]?.id ?? "";
      });
    });

    return () => {
      cancelled = true;
    };
  }, [classId, date]);

  const isSubmitting = submitPhase !== "idle";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!classId || !memberId || !date || !scheduleId) {
      setErrorMessage("Preencha todos os campos para agendar.");
      return;
    }

    if (!isGradeDay) {
      setErrorMessage(
        `Esta modalidade não possui horários na grade para ${weekdayLabels[selectedDayOfWeek] ?? "este dia"}. Dias disponíveis: ${formatScheduleWeekdays(gradeWeekdays)}.`,
      );
      return;
    }

    startTransition(async () => {
      setSubmitPhase("validating");

      const validation = await validateClassSlotAction(scheduleId, date);

      if (!validation.success) {
        setSubmitPhase("idle");
        setErrorMessage(validation.error);
        return;
      }

      if (validation.data.remainingSlots <= 0) {
        setSubmitPhase("idle");
        setErrorMessage("Não há vagas disponíveis para este horário.");
        return;
      }

      setSubmitPhase("confirming");

      const result = await createAppointmentAction(memberId, scheduleId, date, slug);

      setSubmitPhase("idle");

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      dispatchAppointmentsChanged();
      onSuccess();
    });
  }

  const submitLabel =
    submitPhase === "validating"
      ? "Verificando disponibilidade…"
      : submitPhase === "confirming"
        ? "Confirmando agendamento…"
        : "Confirmar agendamento";

  const slotsEmptyMessage = slotsLoading
    ? "Carregando horários da grade…"
    : !isGradeDay
      ? `Sem horários na grade para ${weekdayLabels[selectedDayOfWeek] ?? "este dia"}`
      : "Nenhum horário configurado na grade para esta data";

  return (
    <ModalOverlay scrollable>
      <ModalPanel className="relative w-full max-w-md">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className={glassTextStyles.modalTitle}>Agendar aula</h2>
            <p className={cn("mt-1 text-sm", glassText.muted)}>
              {isClassLocked
                ? "Horários disponíveis conforme a grade desta modalidade"
                : "Selecione a modalidade e um horário da grade"}
            </p>
          </div>

          <IconButton
            shape="round"
            size="sm"
            aria-label="Fechar"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="size-4" />
          </IconButton>
        </div>

        {errorMessage ? <InlineAlert className="mb-4 text-xs">{errorMessage}</InlineAlert> : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField label="Aula" htmlFor="schedule-class">
            <GlassSelect
              id="schedule-class"
              options={classOptions}
              value={classId}
              disabled={isClassLocked || isSubmitting}
              onChange={(event) => {
                setClassId(event.target.value);
                setScheduleId("");
              }}
            />
          </FormField>

          {gradeWeekdays.length > 0 ? (
            <p className={cn("text-xs", glassText.muted)}>
              Grade: {formatScheduleWeekdays(gradeWeekdays)}
            </p>
          ) : null}

          <FormField label="Data" htmlFor="schedule-date">
            <DatePicker
              id="schedule-date"
              value={date}
              onChange={setDate}
              pickerSize="sm"
              tone="muted"
              disabled={isSubmitting}
            />
            <p className={cn("mt-1.5 text-xs", isGradeDay ? glassText.muted : "text-orange-300")}>
              {weekdayLabels[selectedDayOfWeek]}
              {!isGradeDay && gradeWeekdays.length > 0
                ? " — escolha um dia com horário na grade"
                : ""}
            </p>
          </FormField>

          <FormField label="Horário (grade)" htmlFor="schedule-slot">
            <GlassSelect
              id="schedule-slot"
              options={
                bookableSlotOptions.length > 0
                  ? bookableSlotOptions
                  : [{ value: "", label: slotsEmptyMessage }]
              }
              value={scheduleId}
              disabled={
                isSubmitting ||
                slotsLoading ||
                bookableSlotOptions.length === 0 ||
                !isGradeDay
              }
              onChange={(event) => setScheduleId(event.target.value)}
              leftIcon={Clock}
            />
            {availableSlots.length > 0 && bookableSlotOptions.length === 0 && isGradeDay ? (
              <p className={cn("mt-1.5 text-xs text-orange-300")}>
                Todos os horários deste dia estão esgotados.
              </p>
            ) : null}
          </FormField>

          <FormField label="Aluno" htmlFor="schedule-member">
            <GlassSelect
              id="schedule-member"
              options={
                memberOptions.length > 0
                  ? memberOptions
                  : [{ value: "", label: "Nenhum aluno ativo" }]
              }
              value={memberId}
              disabled={isSubmitting || memberOptions.length === 0}
              onChange={(event) => setMemberId(event.target.value)}
              leftIcon={User}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <GlassButton
              variant="subtle"
              size="sm"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </GlassButton>

            <GlassButton
              type="submit"
              size="sm"
              disabled={
                isSubmitting ||
                slotsLoading ||
                !scheduleId ||
                !memberId ||
                !isGradeDay
              }
              className="bg-gradient-to-r from-orange-500 to-orange-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {submitLabel}
                </>
              ) : (
                submitLabel
              )}
            </GlassButton>
          </div>
        </form>
      </ModalPanel>
    </ModalOverlay>
  );
}
