"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type ClassSchedule,
  type ClassScheduleFormValues,
} from "@/components/settings/classes/schedule.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { specialtyMatchesClass } from "@/config/professional-specialties";
import { isUuid } from "@/lib/is-uuid";
import { createClient } from "@/lib/supabase/server";

const SCHEDULE_TABLE = "gym_settings_schedule";
const CLASSES_TABLE = "classes";
const PROFESSIONALS_TABLE = "professionals";
const APPOINTMENTS_TABLE = "appointments";
const SCHEDULE_PATH = "/settings/classes";
const SETTINGS_PATH = "/settings";
const CLASSES_MODULE_PATH = "/classes";

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const MISSING_SCHEDULE_TABLE_MESSAGE =
  "Tabela gym_settings_schedule não existe. Execute supabase/classes.sql no Supabase.";

const scheduleFormSchema = z.object({
  className: z.string().trim().min(1, "Selecione uma aula válida."),
  professionalId: z.string().uuid("Selecione um professor válido."),
  dayOfWeek: z
    .string()
    .refine((value) => ["1", "2", "3", "4", "5"].includes(value), "Selecione um dia da semana."),
  startTime: z
    .string()
    .trim()
    .transform((value) => value.slice(0, 5))
    .pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido (HH:MM).")),
  maxCapacity: z.coerce
    .number()
    .int("Capacidade deve ser um número inteiro.")
    .positive("Capacidade máxima deve ser maior que zero."),
});

type ProfessionalInfo = {
  full_name: string;
  specialty: string;
};

type ScheduleRow = {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  professional_id: string;
  max_capacity: number;
  created_at: string;
  classes: { name: string } | { name: string }[] | null;
  professionals: ProfessionalInfo | ProfessionalInfo[] | null;
};

async function requireAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false as const, error: SESSION_EXPIRED_MESSAGE };

  return { authenticated: true as const, supabase };
}

function mapDatabaseError(message: string): string {
  if (
    message.includes('relation "public.gym_settings_schedule" does not exist') ||
    message.includes("Could not find the table 'public.gym_settings_schedule'") ||
    message.includes("schema cache")
  ) {
    return MISSING_SCHEDULE_TABLE_MESSAGE;
  }

  if (message.includes("gym_settings_schedule_unique_slot")) {
    return "Já existe uma aula cadastrada neste dia e horário.";
  }

  if (message.includes("violates foreign key constraint")) {
    return "Não é possível remover um horário com reservas vinculadas.";
  }

  if (
    message.includes("professional_id") ||
    message.includes("instructor_name") ||
    (message.includes("column") && message.includes("gym_settings_schedule"))
  ) {
    if (message.includes("does not exist") || message.includes("Could not find")) {
      return "Schema desatualizado. Execute supabase/schedule-professionals-integration.sql no Supabase.";
    }
  }

  if (message.includes("professional_id")) {
    return "Selecione um professor válido cadastrado no sistema.";
  }

  return message;
}

function formatStartTime(time: string): string {
  return time.slice(0, 5);
}

function resolveClassName(classes: ScheduleRow["classes"]): string {
  if (!classes) return "Aula";
  return Array.isArray(classes) ? (classes[0]?.name ?? "Aula") : classes.name;
}

function resolveProfessional(
  professionals: ScheduleRow["professionals"],
): ProfessionalInfo | null {
  if (!professionals) return null;
  return Array.isArray(professionals) ? (professionals[0] ?? null) : professionals;
}

function mapScheduleRow(row: ScheduleRow): ClassSchedule {
  const professional = resolveProfessional(row.professionals);

  return {
    id: row.id,
    classId: row.class_id,
    className: resolveClassName(row.classes),
    dayOfWeek: row.day_of_week,
    startTime: formatStartTime(row.start_time),
    professionalId: row.professional_id,
    professionalName: professional?.full_name ?? "—",
    professionalSpecialty: professional?.specialty ?? "—",
    maxCapacity: row.max_capacity,
    createdAt: row.created_at,
  };
}

const SCHEDULE_SELECT = `
  id,
  class_id,
  day_of_week,
  start_time,
  professional_id,
  max_capacity,
  created_at,
  classes ( name ),
  professionals ( full_name, specialty )
` as const;

function revalidateSchedulePaths() {
  revalidatePath(SCHEDULE_PATH);
  revalidatePath(SETTINGS_PATH);
  revalidatePath(CLASSES_MODULE_PATH);
}

async function resolveClassId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  className: string,
): Promise<ActionResult<string>> {
  const { data: existing, error: fetchError } = await supabase
    .from(CLASSES_TABLE)
    .select("id")
    .eq("name", className)
    .maybeSingle();

  if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
  if (existing?.id) return actionSuccess(existing.id);

  const { data: inserted, error: insertError } = await supabase
    .from(CLASSES_TABLE)
    .insert({ name: className })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return actionFailure(mapDatabaseError(insertError?.message ?? "Não foi possível cadastrar a modalidade."));
  }

  return actionSuccess(inserted.id);
}

async function validateProfessionalForClass(
  supabase: Awaited<ReturnType<typeof createClient>>,
  professionalId: string,
  className: string,
): Promise<ActionResult<{ id: string; name: string; specialty: string }>> {
  if (!isUuid(professionalId)) {
    return actionFailure("Selecione um professor válido.");
  }

  const { data: professional, error } = await supabase
    .from(PROFESSIONALS_TABLE)
    .select("id, full_name, specialty, status")
    .eq("id", professionalId)
    .maybeSingle();

  if (error) return actionFailure(mapDatabaseError(error.message));
  if (!professional) return actionFailure("Professor não encontrado.");

  if (!professional.status) {
    return actionFailure("Este profissional está inativo e não pode ser escalado.");
  }

  if (!specialtyMatchesClass(professional.specialty, className)) {
    return actionFailure(
      `Este profissional é especialista em ${professional.specialty} e não pode ministrar ${className}.`,
    );
  }

  return actionSuccess({
    id: professional.id,
    name: professional.full_name,
    specialty: professional.specialty,
  });
}

export async function getClassSchedulesAction(): Promise<ActionResult<ClassSchedule[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(SCHEDULE_TABLE)
      .select(SCHEDULE_SELECT)
      .gte("day_of_week", 1)
      .lte("day_of_week", 5)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) return actionFailure(mapDatabaseError(error.message));

    return actionSuccess((data ?? []).map((row) => mapScheduleRow(row as ScheduleRow)));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar grade de aulas."));
  }
}

export async function createClassScheduleAction(
  formValues: ClassScheduleFormValues,
): Promise<ActionResult<ClassSchedule>> {
  try {
    const parsed = scheduleFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const classIdResult = await resolveClassId(session.supabase, parsed.data.className);
    if (!classIdResult.success) return classIdResult;

    const professionalResult = await validateProfessionalForClass(
      session.supabase,
      parsed.data.professionalId,
      parsed.data.className,
    );
    if (!professionalResult.success) return professionalResult;

    const { data, error } = await session.supabase
      .from(SCHEDULE_TABLE)
      .insert({
        class_id: classIdResult.data,
        day_of_week: Number(parsed.data.dayOfWeek),
        start_time: parsed.data.startTime,
        professional_id: parsed.data.professionalId,
        max_capacity: parsed.data.maxCapacity,
      })
      .select(SCHEDULE_SELECT)
      .single();

    if (error || !data) {
      return actionFailure(mapDatabaseError(error?.message ?? "Não foi possível cadastrar a aula."));
    }

    revalidateSchedulePaths();
    return actionSuccess(mapScheduleRow(data as ScheduleRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao cadastrar aula."));
  }
}

export async function updateClassScheduleAction(
  id: string,
  formValues: ClassScheduleFormValues,
): Promise<ActionResult<ClassSchedule>> {
  try {
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) return actionFailure("Horário inválido.");

    const parsed = scheduleFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const classIdResult = await resolveClassId(session.supabase, parsed.data.className);
    if (!classIdResult.success) return classIdResult;

    const professionalResult = await validateProfessionalForClass(
      session.supabase,
      parsed.data.professionalId,
      parsed.data.className,
    );
    if (!professionalResult.success) return professionalResult;

    const { data, error } = await session.supabase
      .from(SCHEDULE_TABLE)
      .update({
        class_id: classIdResult.data,
        day_of_week: Number(parsed.data.dayOfWeek),
        start_time: parsed.data.startTime,
        professional_id: parsed.data.professionalId,
        max_capacity: parsed.data.maxCapacity,
      })
      .eq("id", id)
      .select(SCHEDULE_SELECT)
      .single();

    if (error || !data) {
      return actionFailure(mapDatabaseError(error?.message ?? "Não foi possível atualizar a aula."));
    }

    revalidateSchedulePaths();
    return actionSuccess(mapScheduleRow(data as ScheduleRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar aula."));
  }
}

export async function deleteClassScheduleAction(id: string): Promise<ActionResult<null>> {
  try {
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) return actionFailure("Horário inválido.");

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: existing, error: fetchError } = await session.supabase
      .from(SCHEDULE_TABLE)
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
    if (!existing) return actionFailure("Horário não encontrado.");

    const { count, error: countError } = await session.supabase
      .from(APPOINTMENTS_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("schedule_id", id);

    if (countError) return actionFailure(mapDatabaseError(countError.message));
    if ((count ?? 0) > 0) {
      return actionFailure("Este horário possui reservas vinculadas e não pode ser removido.");
    }

    const { error } = await session.supabase.from(SCHEDULE_TABLE).delete().eq("id", id);

    if (error) return actionFailure(mapDatabaseError(error.message));

    revalidateSchedulePaths();
    return actionSuccess(null);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao remover horário."));
  }
}
