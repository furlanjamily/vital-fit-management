import type { SupabaseClient } from "@supabase/supabase-js";
import { classNameToSlug, matchesClassSlug } from "@/lib/class-slug";

const SCHEDULE_TABLE = "gym_settings_schedule";
const APPOINTMENTS_TABLE = "appointments";
const CLASSES_TABLE = "classes";

export type ClassSlots = {
  totalSlots: number;
  occupiedSlots: number;
  remainingSlots: number;
};

export type AvailableClass = {
  id: string;
  classId: string;
  name: string;
  description: string | null;
  instructor: string;
  time: string;
  totalSlots: number;
  remainingSlots: number;
};

export type BookedAppointment = {
  id: string;
  memberId: string;
  scheduleId: string;
  date: string;
  status: "CONFIRMED" | "CANCELLED";
};

export type ClassNavEntry = {
  id: string;
  name: string;
  slug: string;
  appointmentCount: number;
};

export type ClassAppointment = {
  id: string;
  memberId: string;
  memberName: string;
  scheduleId: string;
  date: string;
  time: string;
  instructor: string;
  className: string;
  status: "CONFIRMED" | "CANCELLED";
};

export type ClassRecord = {
  id: string;
  name: string;
  description: string | null;
};

export type ClassGradeSlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  professionalName: string;
  professionalSpecialty: string;
  maxCapacity: number;
};

type ProfessionalInfo = {
  full_name: string;
  specialty: string;
};

type ScheduleWithClassRow = {
  id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  professional_id: string;
  max_capacity: number;
  classes: ClassInfo | ClassInfo[] | null;
  professionals: ProfessionalInfo | ProfessionalInfo[] | null;
};

function resolveProfessionalInfo(
  professionals: ScheduleWithClassRow["professionals"],
): ProfessionalInfo | null {
  if (!professionals) return null;
  return Array.isArray(professionals) ? (professionals[0] ?? null) : professionals;
}

function resolveInstructorName(
  professionals: ScheduleWithClassRow["professionals"],
): string {
  return resolveProfessionalInfo(professionals)?.full_name ?? "—";
}

function resolveClassInfo(classes: ScheduleWithClassRow["classes"]): ClassInfo | null {
  if (!classes) return null;
  return Array.isArray(classes) ? (classes[0] ?? null) : classes;
}

type ClassSlotsRow = {
  total_slots: number;
  occupied_slots: number;
  remaining_slots: number;
};

type ClassInfo = {
  name: string;
  description: string | null;
};

type AppointmentRow = {
  id: string;
  member_id: string;
  schedule_id: string;
  date: string;
  status: "CONFIRMED" | "CANCELLED";
};

type MemberNameInfo = { full_name: string };

type AppointmentListRow = AppointmentRow & {
  members: MemberNameInfo | MemberNameInfo[] | null;
  gym_settings_schedule: {
    start_time: string;
    professionals: ProfessionalInfo | ProfessionalInfo[] | null;
    classes: ClassInfo | ClassInfo[] | null;
  } | null;
};

export class ClassManagerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassManagerError";
  }
}

function toDateOnlyIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parseia YYYY-MM-DD de forma estável (evita bugs de timezone no day_of_week). */
export function dateFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function getDayOfWeekFromIso(isoDate: string): number {
  return dateFromIso(isoDate).getDay();
}

function formatStartTime(time: string): string {
  return time.slice(0, 5);
}

function mapSlotsRow(row: ClassSlotsRow | null | undefined): ClassSlots {
  return {
    totalSlots: Number(row?.total_slots ?? 0),
    occupiedSlots: Number(row?.occupied_slots ?? 0),
    remainingSlots: Number(row?.remaining_slots ?? 0),
  };
}

function mapAppointmentRow(row: AppointmentRow): BookedAppointment {
  return {
    id: row.id,
    memberId: row.member_id,
    scheduleId: row.schedule_id,
    date: row.date,
    status: row.status,
  };
}

function resolveMemberName(
  members: AppointmentListRow["members"],
): string {
  if (!members) return "Aluno";
  const member = Array.isArray(members) ? (members[0] ?? null) : members;
  return member?.full_name ?? "Aluno";
}

function mapAppointmentListRow(row: AppointmentListRow): ClassAppointment {
  const schedule = row.gym_settings_schedule;
  const classInfo = schedule ? resolveClassInfo(schedule.classes) : null;

  return {
    id: row.id,
    memberId: row.member_id,
    memberName: resolveMemberName(row.members),
    scheduleId: row.schedule_id,
    date: row.date,
    time: schedule ? formatStartTime(schedule.start_time) : "—",
    instructor: schedule
      ? resolveInstructorName(schedule.professionals)
      : "—",
    className: classInfo?.name ?? "Aula",
    status: row.status,
  };
}

export async function getClassSlots(
  supabase: SupabaseClient,
  date: Date,
  scheduleId: string,
): Promise<ClassSlots> {
  const { data, error } = await supabase.rpc("get_class_slots", {
    p_date: toDateOnlyIso(date),
    p_schedule_id: scheduleId,
  });

  if (error) {
    throw new ClassManagerError(error.message);
  }

  const row = Array.isArray(data)
    ? (data[0] as ClassSlotsRow | undefined)
    : (data as ClassSlotsRow | null);

  return mapSlotsRow(row);
}

/**
 * Retorna slots da grade (gym_settings_schedule) para uma modalidade e data,
 * cruzando com get_class_slots para calcular vagas restantes.
 */
export async function getClassScheduleSlots(
  supabase: SupabaseClient,
  classId: string,
  dateInput: string | Date,
): Promise<AvailableClass[]> {
  const date =
    typeof dateInput === "string" ? dateFromIso(dateInput) : dateInput;
  const isoDate = typeof dateInput === "string" ? dateInput : toDateOnlyIso(date);
  const dayOfWeek = typeof dateInput === "string"
    ? getDayOfWeekFromIso(dateInput)
    : date.getDay();

  const { data, error } = await supabase
    .from(SCHEDULE_TABLE)
    .select(
      `
      id,
      class_id,
      day_of_week,
      start_time,
      professional_id,
      max_capacity,
      classes ( name, description ),
      professionals ( full_name, specialty )
    `,
    )
    .eq("class_id", classId)
    .eq("day_of_week", dayOfWeek)
    .order("start_time", { ascending: true });

  if (error) {
    throw new ClassManagerError(error.message);
  }

  const schedules = (data ?? []) as unknown as ScheduleWithClassRow[];

  return Promise.all(
    schedules.map(async (schedule) => {
      const classInfo = resolveClassInfo(schedule.classes);
      const slots = await getClassSlots(supabase, date, schedule.id);

      return {
        id: schedule.id,
        classId: schedule.class_id,
        name: classInfo?.name ?? "Aula",
        description: classInfo?.description ?? null,
        instructor: resolveInstructorName(schedule.professionals),
        time: formatStartTime(schedule.start_time),
        totalSlots: slots.totalSlots,
        remainingSlots: slots.remainingSlots,
      };
    }),
  );
}

/** Dias da semana (0–6) em que a modalidade possui horários na grade. */
export async function getClassScheduleWeekdays(
  supabase: SupabaseClient,
  classId: string,
): Promise<number[]> {
  const { data, error } = await supabase
    .from(SCHEDULE_TABLE)
    .select("day_of_week")
    .eq("class_id", classId)
    .order("day_of_week", { ascending: true });

  if (error) {
    throw new ClassManagerError(error.message);
  }

  const weekdays = [...new Set((data ?? []).map((row) => row.day_of_week as number))];
  return weekdays.sort((a, b) => a - b);
}

/**
 * Retorna apenas os slots configurados em gym_settings_schedule para o dia da data informada,
 * cruzando com get_class_slots para calcular vagas restantes.
 */
export async function getAvailableClasses(
  supabase: SupabaseClient,
  date: Date,
  classId?: string,
): Promise<AvailableClass[]> {
  const dayOfWeek = date.getDay();

  let query = supabase
    .from(SCHEDULE_TABLE)
    .select(
      `
      id,
      class_id,
      day_of_week,
      start_time,
      professional_id,
      max_capacity,
      classes ( name, description ),
      professionals ( full_name, specialty )
    `,
    )
    .eq("day_of_week", dayOfWeek)
    .order("start_time", { ascending: true });

  if (classId) {
    query = query.eq("class_id", classId);
  }

  const { data, error } = await query;

  if (error) {
    throw new ClassManagerError(error.message);
  }

  const schedules = (data ?? []) as unknown as ScheduleWithClassRow[];

  const availableClasses = await Promise.all(
    schedules.map(async (schedule) => {
      const classInfo = resolveClassInfo(schedule.classes);
      const slots = await getClassSlots(supabase, date, schedule.id);

      return {
        id: schedule.id,
        classId: schedule.class_id,
        name: classInfo?.name ?? "Aula",
        description: classInfo?.description ?? null,
        instructor: resolveInstructorName(schedule.professionals),
        time: formatStartTime(schedule.start_time),
        totalSlots: slots.totalSlots,
        remainingSlots: slots.remainingSlots,
      };
    }),
  );

  return availableClasses;
}

/**
 * Reserva uma vaga apenas quando remaining_slots > 0 e o dia da data coincide com a grade.
 */
export async function bookClass(
  supabase: SupabaseClient,
  memberId: string,
  scheduleId: string,
  date: Date,
): Promise<BookedAppointment> {
  const dateIso = toDateOnlyIso(date);

  const { data: schedule, error: scheduleError } = await supabase
    .from(SCHEDULE_TABLE)
    .select("id, day_of_week, class_id")
    .eq("id", scheduleId)
    .maybeSingle();

  if (scheduleError) {
    throw new ClassManagerError(scheduleError.message);
  }

  if (!schedule) {
    throw new ClassManagerError("Horário não encontrado na grade configurada.");
  }

  const expectedDay = getDayOfWeekFromIso(dateIso);
  if (schedule.day_of_week !== expectedDay) {
    throw new ClassManagerError("Esta aula não está disponível na data selecionada.");
  }

  const slots = await getClassSlots(supabase, date, scheduleId);

  if (slots.remainingSlots <= 0) {
    throw new ClassManagerError("Não há vagas disponíveis para esta aula.");
  }

  const { data: appointment, error: insertError } = await supabase
    .from(APPOINTMENTS_TABLE)
    .insert({
      member_id: memberId,
      schedule_id: scheduleId,
      date: dateIso,
      status: "CONFIRMED",
    })
    .select("id, member_id, schedule_id, date, status")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      throw new ClassManagerError("Este aluno já possui reserva neste horário.");
    }

    throw new ClassManagerError(insertError.message);
  }

  return mapAppointmentRow(appointment as AppointmentRow);
}

/** Utilitário para listar modalidades cadastradas (configurações). */
export async function listClasses(supabase: SupabaseClient): Promise<ClassRecord[]> {
  const { data, error } = await supabase
    .from(CLASSES_TABLE)
    .select("id, name, description")
    .order("name", { ascending: true });

  if (error) {
    throw new ClassManagerError(error.message);
  }

  return (data ?? []) as ClassRecord[];
}

/** Grade horária completa de uma modalidade. */
export async function getClassGrade(
  supabase: SupabaseClient,
  classId: string,
): Promise<ClassGradeSlot[]> {
  const { data, error } = await supabase
    .from(SCHEDULE_TABLE)
    .select(
      `
      id,
      day_of_week,
      start_time,
      max_capacity,
      professionals ( full_name, specialty )
    `,
    )
    .eq("class_id", classId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new ClassManagerError(error.message);
  }

  return (data ?? []).map((row) => {
    const professional = resolveProfessionalInfo(
      row.professionals as ProfessionalInfo | ProfessionalInfo[] | null,
    );

    return {
      id: row.id as string,
      dayOfWeek: row.day_of_week as number,
      startTime: formatStartTime(row.start_time as string),
      professionalName: professional?.full_name ?? "—",
      professionalSpecialty: professional?.specialty ?? "—",
      maxCapacity: row.max_capacity as number,
    };
  });
}

export async function getClassBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ClassRecord | null> {
  const classes = await listScheduledClasses(supabase);
  const match = classes.find((item) => matchesClassSlug(item.name, slug));
  if (match) return match;

  const allClasses = await listClasses(supabase);
  return allClasses.find((item) => matchesClassSlug(item.name, slug)) ?? null;
}

export async function listScheduledClasses(
  supabase: SupabaseClient,
): Promise<ClassRecord[]> {
  const { data, error } = await supabase
    .from(SCHEDULE_TABLE)
    .select("class_id, classes ( id, name, description )")
    .order("class_id");

  if (error) {
    throw new ClassManagerError(error.message);
  }

  const seen = new Set<string>();
  const classes: ClassRecord[] = [];

  for (const row of data ?? []) {
    const raw = row.classes as ClassRecord | ClassRecord[] | null;
    const classRecord = Array.isArray(raw) ? (raw[0] ?? null) : raw;
    if (!classRecord || seen.has(classRecord.id)) continue;

    seen.add(classRecord.id);
    classes.push(classRecord);
  }

  return classes.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listClassesNav(
  supabase: SupabaseClient,
  date: Date = new Date(),
): Promise<ClassNavEntry[]> {
  const classes = await listScheduledClasses(supabase);
  const dateIso = toDateOnlyIso(date);

  const entries = await Promise.all(
    classes.map(async (item) => {
      const { data: schedules, error: scheduleError } = await supabase
        .from(SCHEDULE_TABLE)
        .select("id")
        .eq("class_id", item.id);

      if (scheduleError) {
        throw new ClassManagerError(scheduleError.message);
      }

      const scheduleIds = (schedules ?? []).map((schedule) => schedule.id);
      let appointmentCount = 0;

      if (scheduleIds.length > 0) {
        const { count, error: countError } = await supabase
          .from(APPOINTMENTS_TABLE)
          .select("id", { count: "exact", head: true })
          .in("schedule_id", scheduleIds)
          .eq("date", dateIso)
          .eq("status", "CONFIRMED");

        if (countError) {
          throw new ClassManagerError(countError.message);
        }

        appointmentCount = count ?? 0;
      }

      return {
        id: item.id,
        name: item.name,
        slug: classNameToSlug(item.name),
        appointmentCount,
      };
    }),
  );

  return entries;
}

export async function listClassAppointments(
  supabase: SupabaseClient,
  classId: string,
  startDate: Date,
  endDate: Date,
): Promise<ClassAppointment[]> {
  const startIso = toDateOnlyIso(startDate);
  const endIso = toDateOnlyIso(endDate);

  const { data: schedules, error: scheduleError } = await supabase
    .from(SCHEDULE_TABLE)
    .select("id")
    .eq("class_id", classId);

  if (scheduleError) {
    throw new ClassManagerError(scheduleError.message);
  }

  const scheduleIds = (schedules ?? []).map((schedule) => schedule.id);
  if (scheduleIds.length === 0) return [];

  const { data, error } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select(
      `
      id,
      member_id,
      schedule_id,
      date,
      status,
      members ( full_name ),
      gym_settings_schedule (
        start_time,
        professionals ( full_name, specialty ),
        classes ( name )
      )
    `,
    )
    .in("schedule_id", scheduleIds)
    .gte("date", startIso)
    .lte("date", endIso)
    .eq("status", "CONFIRMED")
    .order("date", { ascending: true });

  if (error) {
    throw new ClassManagerError(error.message);
  }

  const rows = (data ?? []) as unknown as AppointmentListRow[];

  return rows
    .map(mapAppointmentListRow)
    .sort((left, right) => {
      const dateCompare = left.date.localeCompare(right.date);
      if (dateCompare !== 0) return dateCompare;
      return left.time.localeCompare(right.time);
    });
}

export async function deleteAppointment(
  supabase: SupabaseClient,
  appointmentId: string,
  classId: string,
): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from(APPOINTMENTS_TABLE)
    .select(
      `
      id,
      gym_settings_schedule ( class_id )
    `,
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchError) {
    throw new ClassManagerError(fetchError.message);
  }

  if (!data) {
    throw new ClassManagerError("Agendamento não encontrado.");
  }

  const schedule = data.gym_settings_schedule as
    | { class_id: string }
    | { class_id: string }[]
    | null;
  const scheduleClassId = Array.isArray(schedule)
    ? schedule[0]?.class_id
    : schedule?.class_id;

  if (scheduleClassId !== classId) {
    throw new ClassManagerError("Agendamento não pertence a esta modalidade.");
  }

  const { error: deleteError } = await supabase
    .from(APPOINTMENTS_TABLE)
    .delete()
    .eq("id", appointmentId);

  if (deleteError) {
    throw new ClassManagerError(deleteError.message);
  }
}

/**
 * Valida disponibilidade via RPC get_class_slots antes de confirmar reserva.
 */
export async function createAppointment(
  supabase: SupabaseClient,
  memberId: string,
  scheduleId: string,
  date: Date,
): Promise<BookedAppointment> {
  const slots = await getClassSlots(supabase, date, scheduleId);

  if (slots.remainingSlots <= 0) {
    throw new ClassManagerError("Não há vagas disponíveis para esta aula.");
  }

  return bookClass(supabase, memberId, scheduleId, date);
}
