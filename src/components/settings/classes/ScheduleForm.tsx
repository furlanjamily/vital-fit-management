"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { Clock, User } from "lucide-react";
import { listAllClassesAction } from "@/app/(app)/classes/actions";
import { getScheduleProfessionalsAction } from "@/app/(app)/professionals/actions";
import { Button } from "@/components/common/button/Button";
import {
  FormField,
  GlassButton,
  GlassInput,
  GlassSelect,
} from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import type { ScheduleProfessionalOption } from "@/components/professionals/professionals.types";
import {
  classScheduleNameOptions,
  WEEKDAY_OPTIONS,
  type ClassSchedule,
  type ClassScheduleFormValues,
} from "@/components/settings/classes/schedule.types";
import { specialtyMatchesClass } from "@/config/professional-specialties";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { toastError, toastSuccess } from "@/lib/toast-utils";

const EMPTY_VALUES: ClassScheduleFormValues = {
  className: "Crossfit",
  professionalId: "",
  dayOfWeek: "1",
  startTime: "",
  maxCapacity: "",
};

function buildInitialValues(schedule: ClassSchedule | null): ClassScheduleFormValues {
  if (!schedule) return EMPTY_VALUES;

  return {
    className: schedule.className,
    professionalId: schedule.professionalId,
    dayOfWeek: String(schedule.dayOfWeek),
    startTime: schedule.startTime,
    maxCapacity: String(schedule.maxCapacity),
  };
}

type ScheduleFormProps = {
  editingSchedule: ClassSchedule | null;
  onSuccess: (schedule: ClassSchedule) => void;
  onCancel: () => void;
  createAction: typeof import("@/app/(app)/settings/classes/actions").createClassScheduleAction;
  updateAction: typeof import("@/app/(app)/settings/classes/actions").updateClassScheduleAction;
};

export function ScheduleForm({
  editingSchedule,
  onSuccess,
  onCancel,
  createAction,
  updateAction,
}: ScheduleFormProps) {
  const [values, setValues] = useState<ClassScheduleFormValues>(() =>
    buildInitialValues(editingSchedule),
  );
  const [dbClassOptions, setDbClassOptions] = useState<{ value: string; label: string }[]>([]);
  const [professionals, setProfessionals] = useState<ScheduleProfessionalOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, startSubmitTransition] = useTransition();

  const isEditing = Boolean(editingSchedule);

  const classNameOptions = useMemo(() => {
    const names = new Set<string>([
      ...classScheduleNameOptions.map((option) => option.value),
      ...dbClassOptions.map((option) => option.value),
    ]);

    if (isEditing && editingSchedule?.className) {
      names.add(editingSchedule.className);
    }

    return [...names]
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((name) => ({ value: name, label: name }));
  }, [dbClassOptions, isEditing, editingSchedule?.className]);

  const eligibleProfessionals = useMemo(
    () =>
      professionals.filter(
        (professional) =>
          professional.status === "active" &&
          specialtyMatchesClass(professional.specialty, values.className),
      ),
    [professionals, values.className],
  );

  const professionalOptions = useMemo(() => {
    if (isLoadingOptions) {
      return [{ value: "", label: "Carregando profissionais…" }];
    }

    if (eligibleProfessionals.length === 0) {
      return [
        {
          value: "",
          label: `Nenhum profissional de ${values.className} cadastrado`,
        },
      ];
    }

    return eligibleProfessionals.map((professional) => ({
      value: professional.id,
      label: `${professional.name} — ${professional.specialty}`,
    }));
  }, [eligibleProfessionals, isLoadingOptions, values.className]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setIsLoadingOptions(true);

      const [classesResult, professionalsResult] = await Promise.all([
        listAllClassesAction(),
        getScheduleProfessionalsAction(),
      ]);

      if (cancelled) return;

      if (classesResult.success) {
        setDbClassOptions(
          classesResult.data.map((item) => ({ value: item.name, label: item.name })),
        );
      }

      if (professionalsResult.success) {
        setProfessionals(professionalsResult.data);
      } else {
        toastError(professionalsResult.error);
      }

      setIsLoadingOptions(false);
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoadingOptions || eligibleProfessionals.length === 0) return;

    setValues((current) => {
      const stillEligible = eligibleProfessionals.some(
        (professional) => professional.id === current.professionalId,
      );

      if (stillEligible) return current;

      return {
        ...current,
        professionalId: eligibleProfessionals[0]?.id ?? "",
      };
    });
  }, [eligibleProfessionals, isLoadingOptions]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.professionalId) {
      toastError(
        `Cadastre um profissional ativo com especialidade em ${values.className} em Profissionais antes de adicionar este horário.`,
      );
      return;
    }

    if (!values.startTime || !values.maxCapacity) {
      toastError("Preencha horário e capacidade máxima.");
      return;
    }

    startSubmitTransition(async () => {
      const payload: ClassScheduleFormValues = {
        ...values,
        startTime: values.startTime.slice(0, 5),
      };

      const result = isEditing
        ? await updateAction(editingSchedule!.id, payload)
        : await createAction(payload);

      if (!result.success) {
        toastError(result.error);
        return;
      }

      toastSuccess(
        isEditing ? "Horário atualizado com sucesso." : "Horário adicionado com sucesso.",
      );
      onSuccess(result.data);
    });
  }

  const canSubmit =
    !isSubmitting &&
    !isLoadingOptions &&
    Boolean(values.professionalId) &&
    Boolean(values.startTime) &&
    Boolean(values.maxCapacity);

  return (
    <ResponsiveModal
      isOpen
      onClose={onCancel}
      title={isEditing ? "Editar aula" : "Adicionar aula"}
      description="Vincule a modalidade a um profissional habilitado na grade"
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField label="Aula" htmlFor="className">
          <GlassSelect
            id="className"
            options={classNameOptions}
            value={values.className}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                className: event.target.value,
                professionalId: "",
              }))
            }
          />
        </FormField>

        <FormField label="Professor" htmlFor="professionalId">
          <GlassSelect
            id="professionalId"
            options={professionalOptions}
            value={values.professionalId}
            disabled={isLoadingOptions || isSubmitting || eligibleProfessionals.length === 0}
            onChange={(event) =>
              setValues((current) => ({ ...current, professionalId: event.target.value }))
            }
            leftIcon={User}
          />
          <p className={cn("mt-1.5 text-xs", glassText.muted)}>
            {isLoadingOptions
              ? "Carregando profissionais…"
              : `Apenas profissionais com especialidade em ${values.className}`}
          </p>
        </FormField>

        <FormField label="Dia da Semana" htmlFor="dayOfWeek">
          <GlassSelect
            id="dayOfWeek"
            options={[...WEEKDAY_OPTIONS]}
            value={values.dayOfWeek}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, dayOfWeek: event.target.value }))
            }
          />
        </FormField>

        <FormField label="Horário" htmlFor="startTime">
          <GlassInput
            id="startTime"
            type="time"
            leftIcon={Clock}
            value={values.startTime}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, startTime: event.target.value }))
            }
            required
          />
        </FormField>

        <FormField label="Capacidade Máxima" htmlFor="maxCapacity">
          <GlassInput
            id="maxCapacity"
            type="number"
            min={1}
            placeholder="Ex.: 12"
            value={values.maxCapacity}
            disabled={isSubmitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, maxCapacity: event.target.value }))
            }
            required
          />
        </FormField>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <GlassButton
            variant="subtle"
            size="sm"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </GlassButton>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            {isEditing ? "Salvar alterações" : "Salvar"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
