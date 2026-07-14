"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { isUuid } from "@/lib/is-uuid";
import { createClient } from "@/lib/supabase/server";
import {
  bookClass,
  ClassManagerError,
  createAppointment,
  deleteAppointment,
  dateFromIso,
  getAvailableClasses,
  getClassGrade,
  getClassBySlug,
  getClassScheduleSlots,
  getClassScheduleWeekdays,
  getClassSlots,
  listClassAppointments,
  listClasses,
  listClassesNav,
  listScheduledClasses,
  type AvailableClass,
  type BookedAppointment,
  type ClassAppointment,
  type ClassGradeSlot,
  type ClassNavEntry,
  type ClassRecord,
  type ClassSlots,
} from "@/services/class-manager";

const CLASSES_PATH = "/classes";
const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const INVALID_MEMBER_ID_MESSAGE = "ID de aluno inválido.";
const INVALID_SCHEDULE_ID_MESSAGE = "ID de horário inválido.";
const INVALID_DATE_MESSAGE = "Data inválida.";
const INVALID_CLASS_MESSAGE = "Aula não encontrada.";
const MISSING_CLASSES_TABLE_MESSAGE =
  "Tabelas de aulas não existem. Execute supabase/classes.sql no SQL Editor do Supabase.";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type AuthenticatedSession =
  | { authenticated: true; supabase: ServerSupabaseClient }
  | { authenticated: false; error: string };

function mapDatabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("classes") ||
    lower.includes("gym_settings_schedule") ||
    lower.includes("appointments") ||
    lower.includes("get_class_slots")
  ) {
    if (lower.includes("does not exist") || lower.includes("could not find")) {
      return MISSING_CLASSES_TABLE_MESSAGE;
    }
  }

  return message;
}

function parseDateInput(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const parsed = dateFromIso(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function requireAuthenticatedClient(): Promise<AuthenticatedSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false, error: SESSION_EXPIRED_MESSAGE };

  return { authenticated: true, supabase };
}

function mapClassManagerError(error: ClassManagerError): string {
  return mapDatabaseError(error.message);
}

function revalidateClassesPaths(slug?: string) {
  revalidatePath(CLASSES_PATH);
  if (slug) revalidatePath(`${CLASSES_PATH}/${slug}`);
}

export async function listClassesAction(): Promise<ActionResult<ClassRecord[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const classes = await listScheduledClasses(session.supabase);
    return actionSuccess(classes);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar as aulas."));
  }
}

export async function listAllClassesAction(): Promise<ActionResult<ClassRecord[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const classes = await listClasses(session.supabase);
    return actionSuccess(classes);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar as aulas."));
  }
}

export async function listClassesNavAction(
  dateInput?: string | Date,
): Promise<ActionResult<ClassNavEntry[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const date = dateInput ? parseDateInput(dateInput) : new Date();
    if (!date) return actionFailure(INVALID_DATE_MESSAGE);

    const items = await listClassesNav(session.supabase, date);
    return actionSuccess(items);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar a navegação de aulas."));
  }
}

export async function getClassGradeAction(
  classId: string,
): Promise<ActionResult<ClassGradeSlot[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(classId)) return actionFailure("ID de aula inválido.");

    const grade = await getClassGrade(session.supabase, classId);
    return actionSuccess(grade);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar a grade da aula."));
  }
}

export async function getClassBySlugAction(slug: string): Promise<ActionResult<ClassRecord>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const classRecord = await getClassBySlug(session.supabase, slug);
    if (!classRecord) return actionFailure(INVALID_CLASS_MESSAGE);

    return actionSuccess(classRecord);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar a aula."));
  }
}

export async function listClassAppointmentsAction(
  slug: string,
  startDateInput: string | Date,
  endDateInput: string | Date,
): Promise<ActionResult<ClassAppointment[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const classRecord = await getClassBySlug(session.supabase, slug);
    if (!classRecord) return actionFailure(INVALID_CLASS_MESSAGE);

    const startDate = parseDateInput(startDateInput);
    const endDate = parseDateInput(endDateInput);
    if (!startDate || !endDate) return actionFailure(INVALID_DATE_MESSAGE);

    const appointments = await listClassAppointments(
      session.supabase,
      classRecord.id,
      startDate,
      endDate,
    );

    return actionSuccess(appointments);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar os agendamentos."));
  }
}

export async function getAvailableClassesAction(
  dateInput: string | Date,
  classId?: string,
): Promise<ActionResult<AvailableClass[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const date = parseDateInput(dateInput);
    if (!date) return actionFailure(INVALID_DATE_MESSAGE);

    let classes = await getAvailableClasses(session.supabase, date, classId);

    return actionSuccess(classes);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(
      toActionError(error, "Não foi possível carregar a agenda de aulas."),
    );
  }
}

export async function getClassScheduleSlotsAction(
  classId: string,
  dateInput: string,
): Promise<ActionResult<AvailableClass[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(classId)) return actionFailure("ID de aula inválido.");

    const date = parseDateInput(dateInput);
    if (!date) return actionFailure(INVALID_DATE_MESSAGE);

    const slots = await getClassScheduleSlots(session.supabase, classId, dateInput);
    return actionSuccess(slots);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar os horários da grade."));
  }
}

export async function getClassScheduleWeekdaysAction(
  classId: string,
): Promise<ActionResult<number[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(classId)) return actionFailure("ID de aula inválido.");

    const weekdays = await getClassScheduleWeekdays(session.supabase, classId);
    return actionSuccess(weekdays);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível carregar os dias da grade."));
  }
}

export async function validateClassSlotAction(
  scheduleId: string,
  dateInput: string | Date,
): Promise<ActionResult<ClassSlots>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(scheduleId)) return actionFailure(INVALID_SCHEDULE_ID_MESSAGE);

    const date = parseDateInput(dateInput);
    if (!date) return actionFailure(INVALID_DATE_MESSAGE);

    const slots = await getClassSlots(session.supabase, date, scheduleId);
    return actionSuccess(slots);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível verificar a disponibilidade."));
  }
}

export async function createAppointmentAction(
  memberId: string,
  scheduleId: string,
  dateInput: string | Date,
  slug?: string,
): Promise<ActionResult<BookedAppointment>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(memberId)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);
    if (!isUuid(scheduleId)) return actionFailure(INVALID_SCHEDULE_ID_MESSAGE);

    const date = parseDateInput(dateInput);
    if (!date) return actionFailure(INVALID_DATE_MESSAGE);

    const appointment = await createAppointment(
      session.supabase,
      memberId,
      scheduleId,
      date,
    );

    revalidateClassesPaths(slug);
    return actionSuccess(appointment);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(
      toActionError(error, "Não foi possível confirmar o agendamento."),
    );
  }
}

export async function deleteAppointmentAction(
  appointmentId: string,
  slug: string,
): Promise<ActionResult<null>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(appointmentId)) return actionFailure("ID de agendamento inválido.");

    const classRecord = await getClassBySlug(session.supabase, slug);
    if (!classRecord) return actionFailure(INVALID_CLASS_MESSAGE);

    await deleteAppointment(session.supabase, appointmentId, classRecord.id);

    revalidateClassesPaths(slug);
    return actionSuccess(null);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(toActionError(error, "Não foi possível remover o agendamento."));
  }
}

/** @deprecated Use createAppointmentAction — mantido para compatibilidade. */
export async function bookClassAction(
  memberId: string,
  scheduleId: string,
  dateInput: string | Date,
): Promise<ActionResult<BookedAppointment>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    if (!isUuid(memberId)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);
    if (!isUuid(scheduleId)) return actionFailure(INVALID_SCHEDULE_ID_MESSAGE);

    const date = parseDateInput(dateInput);
    if (!date) return actionFailure(INVALID_DATE_MESSAGE);

    const appointment = await bookClass(
      session.supabase,
      memberId,
      scheduleId,
      date,
    );

    revalidatePath(CLASSES_PATH);
    return actionSuccess(appointment);
  } catch (error) {
    if (error instanceof ClassManagerError) {
      return actionFailure(mapClassManagerError(error));
    }

    return actionFailure(
      toActionError(error, "Não foi possível reservar a aula."),
    );
  }
}
