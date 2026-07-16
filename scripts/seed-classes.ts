/**
 * VitalFit Management — seed de aulas, grade horária e agendamentos
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PRÉ-REQUISITOS (Supabase SQL Editor, nesta ordem)
 * ═══════════════════════════════════════════════════════════════════════════
 *   1. supabase/members.sql
 *   2. supabase/professionals.sql
 *   3. supabase/classes.sql
 *   4. supabase/schedule-professionals-integration.sql  (coluna specialty + FK)
 *   5. supabase/appointments-pending-status.sql         (status PENDING)
 *
 * Alunos: execute antes `npm run seed` ou `npm run seed:members` para ter membros.
 *
 * Variáveis no .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Execução:
 *   npm run seed:classes
 *   npx tsx scripts/seed-classes.ts
 *
 * IDEMPOTENTE: limpa appointments, gym_settings_schedule e profissionais
 * marcados com @classseed.vitalfit.local antes de reinserir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SEED_EMAIL_DOMAIN = "@classseed.vitalfit.local";
const TARGET_APPOINTMENTS = 420;
const APPOINTMENT_DAYS = 14;

type AppointmentStatus = "CONFIRMED" | "PENDING";

type ProfessionalSeed = {
  full_name: string;
  email: string;
  cref: string;
  birth_date: string;
  gender: "Male" | "Female" | "Other";
  shift: "Morning" | "Afternoon" | "Night" | "FullTime";
  specialty: string;
  status: boolean;
};

type ClassSeed = {
  name: string;
  description: string;
  category: "funcional" | "cardio" | "mente_corpo";
};

type ScheduleSlotSeed = {
  className: string;
  dayOfWeek: number;
  startTime: string;
  maxCapacity: number;
};

const PROFESSIONALS: ProfessionalSeed[] = [
  {
    full_name: "Fernanda Alves",
    email: `fernanda.yoga${SEED_EMAIL_DOMAIN}`,
    cref: "200001-G/SP",
    birth_date: "1989-04-08",
    gender: "Female",
    shift: "Morning",
    specialty: "Yoga",
    status: true,
  },
  {
    full_name: "Ana Costa",
    email: `ana.crossfit${SEED_EMAIL_DOMAIN}`,
    cref: "200002-G/SP",
    birth_date: "1988-03-12",
    gender: "Female",
    shift: "Morning",
    specialty: "Crossfit",
    status: true,
  },
  {
    full_name: "Ricardo Menezes",
    email: `ricardo.spinning${SEED_EMAIL_DOMAIN}`,
    cref: "200003-G/SP",
    birth_date: "1986-06-15",
    gender: "Male",
    shift: "Afternoon",
    specialty: "Spinning",
    status: true,
  },
  {
    full_name: "Juliana Prado",
    email: `juliana.danca${SEED_EMAIL_DOMAIN}`,
    cref: "200004-G/SP",
    birth_date: "1991-02-20",
    gender: "Female",
    shift: "Night",
    specialty: "Dança",
    status: true,
  },
  {
    full_name: "Marcos Teixeira",
    email: `marcos.pilates${SEED_EMAIL_DOMAIN}`,
    cref: "200005-G/SP",
    birth_date: "1984-11-30",
    gender: "Male",
    shift: "FullTime",
    specialty: "Pilates",
    status: true,
  },
  {
    full_name: "Diego Souza",
    email: `diego.trx${SEED_EMAIL_DOMAIN}`,
    cref: "200006-G/SP",
    birth_date: "1987-01-18",
    gender: "Male",
    shift: "Morning",
    specialty: "TRX",
    status: true,
  },
  {
    full_name: "Camila Ribeiro",
    email: `camila.jump${SEED_EMAIL_DOMAIN}`,
    cref: "200007-G/SP",
    birth_date: "1993-08-14",
    gender: "Female",
    shift: "Afternoon",
    specialty: "Jump",
    status: true,
  },
];

const CLASSES: ClassSeed[] = [
  { name: "Crossfit", description: "Treino funcional de alta intensidade", category: "funcional" },
  { name: "TRX", description: "Suspensão com foco em força e estabilidade", category: "funcional" },
  { name: "Spinning", description: "Ciclismo indoor com ritmo e resistência", category: "cardio" },
  { name: "Jump", description: "Aula de salto com coreografia e resistência", category: "cardio" },
  { name: "Yoga", description: "Flexibilidade, respiração e equilíbrio", category: "mente_corpo" },
  { name: "Pilates", description: "Fortalecimento, postura e controle corporal", category: "mente_corpo" },
  { name: "Dança", description: "Coreografias e condicionamento com música", category: "mente_corpo" },
];

const SCHEDULE_SLOTS: ScheduleSlotSeed[] = [
  { className: "Crossfit", dayOfWeek: 1, startTime: "07:00", maxCapacity: 18 },
  { className: "Crossfit", dayOfWeek: 1, startTime: "18:00", maxCapacity: 18 },
  { className: "Crossfit", dayOfWeek: 3, startTime: "07:00", maxCapacity: 15 },
  { className: "Crossfit", dayOfWeek: 3, startTime: "19:00", maxCapacity: 15 },
  { className: "Crossfit", dayOfWeek: 5, startTime: "08:00", maxCapacity: 15 },
  { className: "Crossfit", dayOfWeek: 5, startTime: "19:00", maxCapacity: 15 },
  { className: "Yoga", dayOfWeek: 1, startTime: "09:00", maxCapacity: 12 },
  { className: "Yoga", dayOfWeek: 3, startTime: "09:00", maxCapacity: 12 },
  { className: "Yoga", dayOfWeek: 5, startTime: "09:00", maxCapacity: 10 },
  { className: "Yoga", dayOfWeek: 6, startTime: "09:00", maxCapacity: 12 },
  { className: "Spinning", dayOfWeek: 2, startTime: "07:30", maxCapacity: 14 },
  { className: "Spinning", dayOfWeek: 2, startTime: "18:30", maxCapacity: 14 },
  { className: "Spinning", dayOfWeek: 4, startTime: "07:30", maxCapacity: 14 },
  { className: "Spinning", dayOfWeek: 4, startTime: "19:00", maxCapacity: 14 },
  { className: "Spinning", dayOfWeek: 6, startTime: "10:00", maxCapacity: 12 },
  { className: "Dança", dayOfWeek: 2, startTime: "18:00", maxCapacity: 16 },
  { className: "Dança", dayOfWeek: 4, startTime: "18:00", maxCapacity: 16 },
  { className: "Dança", dayOfWeek: 6, startTime: "11:00", maxCapacity: 14 },
  { className: "Pilates", dayOfWeek: 1, startTime: "10:30", maxCapacity: 10 },
  { className: "Pilates", dayOfWeek: 3, startTime: "10:30", maxCapacity: 10 },
  { className: "Pilates", dayOfWeek: 5, startTime: "17:00", maxCapacity: 10 },
  { className: "TRX", dayOfWeek: 2, startTime: "08:00", maxCapacity: 12 },
  { className: "TRX", dayOfWeek: 4, startTime: "08:00", maxCapacity: 12 },
  { className: "TRX", dayOfWeek: 4, startTime: "19:00", maxCapacity: 12 },
  { className: "Jump", dayOfWeek: 3, startTime: "18:30", maxCapacity: 14 },
  { className: "Jump", dayOfWeek: 5, startTime: "18:30", maxCapacity: 14 },
  { className: "Jump", dayOfWeek: 6, startTime: "09:30", maxCapacity: 12 },
];

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function loadEnv() {
  const vars: Record<string, string> = {};

  try {
    const content = readFileSync(resolve(ROOT, ".env"), "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  } catch {
    // .env opcional se variáveis já estiverem no ambiente
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? vars.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? vars.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function randomPick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function assertTable(error: { message: string } | null, table: string, sqlFile: string) {
  if (!error) return;
  if (error.message.includes("Could not find the table")) {
    fail(`Tabela ${table} não existe. Execute ${sqlFile}.`);
  }
}

// ---------------------------------------------------------------------------
// Validação de schema
// ---------------------------------------------------------------------------

async function ensureSpecialtyColumn(supabase: SupabaseClient) {
  const { error } = await supabase.from("professionals").select("specialty").limit(1);

  if (error) {
    if (error.message.includes("specialty")) {
      fail(
        "Coluna professionals.specialty ausente. Execute supabase/schedule-professionals-integration.sql.",
      );
    }
    assertTable(error, "professionals", "supabase/professionals.sql");
    fail(`Erro ao validar professionals.specialty: ${error.message}`);
  }
}

async function ensurePendingStatus(supabase: SupabaseClient) {
  const { data: members, error: membersError } = await supabase.from("members").select("id").limit(1);

  if (membersError) {
    assertTable(membersError, "members", "supabase/members.sql");
    fail(`Erro ao buscar membros: ${membersError.message}`);
  }

  const memberId = members?.[0]?.id as string | undefined;
  if (!memberId) {
    fail("Nenhum membro encontrado. Execute npm run seed ou npm run seed:members antes.");
  }

  const { data: schedules, error: scheduleError } = await supabase
    .from("gym_settings_schedule")
    .select("id")
    .limit(1);

  if (scheduleError) {
    assertTable(scheduleError, "gym_settings_schedule", "supabase/classes.sql");
    fail(`Erro ao buscar grade: ${scheduleError.message}`);
  }

  const scheduleId = schedules?.[0]?.id as string | undefined;

  const { error: pendingError } = await supabase.from("appointments").insert({
    member_id: memberId,
    schedule_id: scheduleId ?? "00000000-0000-0000-0000-000000000001",
    date: "2099-01-01",
    status: "PENDING",
  });

  if (pendingError) {
    if (
      pendingError.message.includes("appointments_status_check") ||
      pendingError.message.includes("violates check constraint")
    ) {
      fail(
        "Status PENDING não permitido em appointments. Execute supabase/appointments-pending-status.sql.",
      );
    }

    if (!scheduleId && pendingError.message.includes("foreign key")) {
      return;
    }
  }

  if (!pendingError) {
    await supabase
      .from("appointments")
      .delete()
      .eq("member_id", memberId)
      .eq("date", "2099-01-01");
  }
}

// ---------------------------------------------------------------------------
// Limpeza idempotente
// ---------------------------------------------------------------------------

async function clearSeedData(supabase: SupabaseClient) {
  console.log("→ Limpando dados anteriores (appointments, grade, profissionais seed)…");

  const { error: appointmentsError } = await supabase
    .from("appointments")
    .delete()
    .gte("date", "1970-01-01");

  if (appointmentsError) {
    assertTable(appointmentsError, "appointments", "supabase/classes.sql");
    fail(`Erro ao limpar appointments: ${appointmentsError.message}`);
  }

  const { error: scheduleError } = await supabase
    .from("gym_settings_schedule")
    .delete()
    .gte("day_of_week", 0);

  if (scheduleError) {
    assertTable(scheduleError, "gym_settings_schedule", "supabase/classes.sql");
    fail(`Erro ao limpar gym_settings_schedule: ${scheduleError.message}`);
  }

  const { error: professionalsError } = await supabase
    .from("professionals")
    .delete()
    .like("email", `%${SEED_EMAIL_DOMAIN}`);

  if (professionalsError) {
    assertTable(professionalsError, "professionals", "supabase/professionals.sql");
    fail(`Erro ao limpar profissionais seed: ${professionalsError.message}`);
  }
}

// ---------------------------------------------------------------------------
// Inserções
// ---------------------------------------------------------------------------

async function upsertClasses(supabase: SupabaseClient): Promise<Map<string, string>> {
  console.log("→ Garantindo modalidades…");

  const payloadWithCategory = CLASSES.map((item) => ({
    name: item.name,
    description: item.description,
    category: item.category,
  }));

  const { error } = await supabase
    .from("classes")
    .upsert(payloadWithCategory, { onConflict: "name", ignoreDuplicates: false });

  if (error) {
    const categoryIssue =
      error.message.includes("classes_category_check") ||
      error.message.includes("category");

    if (categoryIssue) {
      console.log(
        "  Aviso: categorias não aplicadas — execute supabase/classes-workout-categories.sql no Supabase.",
      );

      const { error: retryError } = await supabase.from("classes").upsert(
        CLASSES.map((item) => ({
          name: item.name,
          description: item.description,
        })),
        { onConflict: "name", ignoreDuplicates: false },
      );

      if (retryError) {
        assertTable(retryError, "classes", "supabase/classes.sql");
        fail(`Erro ao inserir classes: ${retryError.message}`);
      }
    } else {
      assertTable(error, "classes", "supabase/classes.sql");
      fail(`Erro ao inserir classes: ${error.message}`);
    }
  }

  const { data, error: fetchError } = await supabase
    .from("classes")
    .select("id, name")
    .in(
      "name",
      CLASSES.map((item) => item.name),
    );

  if (fetchError) fail(`Erro ao buscar classes: ${fetchError.message}`);

  const classMap = new Map<string, string>();
  for (const row of data ?? []) {
    classMap.set(row.name as string, row.id as string);
  }

  for (const item of CLASSES) {
    if (!classMap.has(item.name)) {
      fail(`Modalidade ausente após upsert: ${item.name}`);
    }
  }

  return classMap;
}

type InsertedProfessional = {
  id: string;
  specialty: string;
};

async function insertProfessionals(supabase: SupabaseClient): Promise<InsertedProfessional[]> {
  console.log(`→ Inserindo ${PROFESSIONALS.length} profissionais com especialidades…`);

  const { data, error } = await supabase
    .from("professionals")
    .insert(PROFESSIONALS)
    .select("id, specialty");

  if (error) {
    if (error.message.includes("specialty")) {
      fail(
        "Falha ao inserir specialty. Execute supabase/schedule-professionals-integration.sql.",
      );
    }
    fail(`Erro ao inserir profissionais: ${error.message}`);
  }

  return (data ?? []) as InsertedProfessional[];
}

type InsertedSchedule = {
  id: string;
  day_of_week: number;
  max_capacity: number;
};

async function insertSchedule(
  supabase: SupabaseClient,
  classMap: Map<string, string>,
  professionals: InsertedProfessional[],
): Promise<InsertedSchedule[]> {
  console.log("→ Montando grade horária vinculada aos profissionais…");

  const professionalBySpecialty = new Map(
    professionals.map((item) => [item.specialty, item.id]),
  );

  const payload = SCHEDULE_SLOTS.map((slot) => {
    const classId = classMap.get(slot.className);
    const professionalId = professionalBySpecialty.get(slot.className);

    if (!classId) {
      fail(`Modalidade não encontrada para slot: ${slot.className}`);
    }

    if (!professionalId) {
      fail(
        `Profissional com especialidade "${slot.className}" não encontrado. Verifique integridade do seed.`,
      );
    }

    return {
      class_id: classId,
      day_of_week: slot.dayOfWeek,
      start_time: slot.startTime,
      professional_id: professionalId,
      max_capacity: slot.maxCapacity,
    };
  });

  const { data, error } = await supabase
    .from("gym_settings_schedule")
    .insert(payload)
    .select("id, day_of_week, max_capacity");

  if (error) {
    fail(`Erro ao inserir grade horária: ${error.message}`);
  }

  return (data ?? []) as InsertedSchedule[];
}

type AppointmentInsert = {
  member_id: string;
  schedule_id: string;
  date: string;
  status: AppointmentStatus;
};

type ScheduleCandidate = {
  scheduleId: string;
  dateIso: string;
  maxCapacity: number;
  dayOfWeek: number;
};

function buildAppointmentCandidates(
  schedules: InsertedSchedule[],
  days: number,
): ScheduleCandidate[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const candidates: ScheduleCandidate[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const dayOfWeek = date.getDay();
    const dateIso = toIsoDate(date);

    for (const schedule of schedules) {
      if (schedule.day_of_week !== dayOfWeek) continue;

      candidates.push({
        scheduleId: schedule.id,
        dateIso,
        maxCapacity: schedule.max_capacity,
        dayOfWeek,
      });
    }
  }

  return candidates;
}

function buildAppointments(
  memberIds: string[],
  schedules: InsertedSchedule[],
): AppointmentInsert[] {
  const candidates = buildAppointmentCandidates(schedules, APPOINTMENT_DAYS);

  if (candidates.length === 0) {
    fail(`Nenhum slot de grade coincide com os próximos ${APPOINTMENT_DAYS} dias.`);
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const memberBookings = new Set<string>();
  const appointments: AppointmentInsert[] = [];

  for (const candidate of shuffled) {
    if (appointments.length >= TARGET_APPOINTMENTS) break;

    const pool = [...memberIds].sort(() => Math.random() - 0.5);
    let filled = 0;

    for (const memberId of pool) {
      if (appointments.length >= TARGET_APPOINTMENTS || filled >= candidate.maxCapacity) {
        break;
      }

      const bookingKey = `${memberId}|${candidate.scheduleId}|${candidate.dateIso}`;
      if (memberBookings.has(bookingKey)) continue;

      const status: AppointmentStatus =
        appointments.length % 2 === 0 ? "CONFIRMED" : "PENDING";

      memberBookings.add(bookingKey);
      appointments.push({
        member_id: memberId,
        schedule_id: candidate.scheduleId,
        date: candidate.dateIso,
        status,
      });
      filled += 1;
    }
  }

  if (appointments.length < TARGET_APPOINTMENTS) {
    fail(
      `Só foi possível gerar ${appointments.length}/${TARGET_APPOINTMENTS} agendamentos. ` +
        "Adicione mais membros, aumente APPOINTMENT_DAYS ou a capacidade da grade.",
    );
  }

  return appointments;
}

async function insertAppointments(
  supabase: SupabaseClient,
  memberIds: string[],
  schedules: InsertedSchedule[],
): Promise<number> {
  console.log(`→ Gerando ${TARGET_APPOINTMENTS} agendamentos (próximos ${APPOINTMENT_DAYS} dias)…`);

  const payload = buildAppointments(memberIds, schedules);

  for (const chunk of chunkArray(payload, 50)) {
    const { error } = await supabase.from("appointments").insert(chunk);

    if (error) {
      if (error.message.includes("Não há vagas disponíveis")) {
        fail(
          "Overbooking detectado pelo trigger de capacidade. Revise a lógica do seed ou max_capacity.",
        );
      }
      fail(`Erro ao inserir agendamentos: ${error.message}`);
    }
  }

  const confirmed = payload.filter((item) => item.status === "CONFIRMED").length;
  const pending = payload.filter((item) => item.status === "PENDING").length;

  console.log(`  ${payload.length} agendamentos (${confirmed} confirmados, ${pending} aguardando)`);
  return payload.length;
}

async function fetchMemberIds(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("members").select("id").eq("status", true);

  if (error) {
    assertTable(error, "members", "supabase/members.sql");
    fail(`Erro ao buscar membros: ${error.message}`);
  }

  const ids = (data ?? []).map((row) => row.id as string);

  if (ids.length === 0) {
    fail("Nenhum membro ativo encontrado. Execute npm run seed antes do seed de aulas.");
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { url, serviceRoleKey } = loadEnv();

  if (!url || !serviceRoleKey) {
    fail("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n🏋️  VitalFit — seed de aulas, grade e agendamentos\n");

  await ensureSpecialtyColumn(supabase);
  await ensurePendingStatus(supabase);
  await clearSeedData(supabase);

  const classMap = await upsertClasses(supabase);
  const professionals = await insertProfessionals(supabase);
  const schedules = await insertSchedule(supabase, classMap, professionals);
  const memberIds = await fetchMemberIds(supabase);
  const appointmentCount = await insertAppointments(supabase, memberIds, schedules);

  console.log(
    `\nSeed finalizado! ${professionals.length} profissionais, ${schedules.length} horários de aula e ${appointmentCount} agendamentos criados com sucesso.`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(`Falha inesperada: ${message}`);
});
