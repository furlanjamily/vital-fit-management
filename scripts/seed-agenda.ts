/**
 * VitalFit Management — seed da agenda colaborativa (events + event_participants)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PRÉ-REQUISITOS
 * ═══════════════════════════════════════════════════════════════════════════
 *   1. supabase/collaborative-agenda.sql executado no SQL Editor
 *
 * Variáveis no .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Execução:
 *   npm run seed:agenda
 *   npx tsx scripts/seed-agenda.ts
 *
 * IDEMPOTENTE: trunca events e event_participants antes de reinserir.
 * Usuários de teste são criados/atualizados por e-mail (não são removidos).
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

const SEED_PASSWORD = "VitalFit@Agenda2026";
const SEED_EMAIL_DOMAIN = "@agenda.vitalfit.local";

type EventType = "reuniao" | "tarefa" | "compromisso";
type SeedUserKey = "admin" | "instrutor" | "aluno";

type SeedUser = {
  key: SeedUserKey;
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TRAINER" | "MEMBER";
};

const SEED_USERS: SeedUser[] = [
  {
    key: "admin",
    id: "b1111111-1111-4111-8111-111111111101",
    email: `admin${SEED_EMAIL_DOMAIN}`,
    name: "Ana Admin",
    role: "ADMIN",
  },
  {
    key: "instrutor",
    id: "b2222222-2222-4222-8222-222222222202",
    email: `instrutor${SEED_EMAIL_DOMAIN}`,
    name: "Bruno Instrutor",
    role: "TRAINER",
  },
  {
    key: "aluno",
    id: "b3333333-3333-4333-8333-333333333303",
    email: `aluno${SEED_EMAIL_DOMAIN}`,
    name: "Carla Aluno",
    role: "MEMBER",
  },
];

type EventSeed = {
  title: string;
  description: string;
  dayOffset: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  type: EventType;
  meetingLink?: string;
  location?: string;
  createdBy: SeedUserKey;
  participants: SeedUserKey[];
};

const MEETING_LINKS = [
  "https://meet.google.com/vft-agenda-kickoff",
  "https://zoom.us/j/48291037465",
  "https://teams.microsoft.com/l/meetup-join/agenda-vitalfit-sync",
  "https://meet.google.com/vft-planejamento-semanal",
  "https://zoom.us/j/91827364501",
  "https://meet.google.com/vft-daily-checkin",
  "https://teams.microsoft.com/l/meetup-join/vitalfit-treinamento",
] as const;

const EVENTS_SEED: EventSeed[] = [
  {
    title: "Kickoff semanal",
    description: "Abertura da semana com metas e prioridades da academia.",
    dayOffset: 0,
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    type: "reuniao",
    meetingLink: MEETING_LINKS[0],
    createdBy: "admin",
    participants: ["admin", "instrutor"],
  },
  {
    title: "Atualizar planilha de alunos",
    description: "Conferir cadastros e pendências de documentação.",
    dayOffset: 0,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 30,
    type: "tarefa",
    location: "Recepção",
    createdBy: "instrutor",
    participants: ["instrutor", "aluno"],
  },
  {
    title: "Visita técnica — equipamentos",
    description: "Manutenção preventiva na esteira da sala 2.",
    dayOffset: 0,
    startHour: 16,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    type: "compromisso",
    location: "Sala 2 — Cardio",
    createdBy: "admin",
    participants: ["admin", "aluno"],
  },
  {
    title: "Alinhamento operacional",
    description: "Conflito de teste — reunião sobreposto às 09:00.",
    dayOffset: 1,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: "reuniao",
    meetingLink: MEETING_LINKS[1],
    createdBy: "admin",
    participants: ["admin", "instrutor", "aluno"],
  },
  {
    title: "Compromisso — Avaliação física",
    description: "Conflito de teste — avaliação sobreposta às 09:00.",
    dayOffset: 1,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: "compromisso",
    location: "Sala de avaliação",
    createdBy: "instrutor",
    participants: ["admin", "instrutor", "aluno"],
  },
  {
    title: "Compromisso — Aula experimental",
    description: "Conflito de teste — aula sobreposta às 09:00.",
    dayOffset: 1,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    type: "compromisso",
    location: "Estúdio Funcional",
    createdBy: "aluno",
    participants: ["admin", "instrutor", "aluno"],
  },
  {
    title: "Preparar kits de boas-vindas",
    description: "Montar kits para novos alunos da semana.",
    dayOffset: 1,
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    type: "tarefa",
    location: "Estoque",
    createdBy: "admin",
    participants: ["admin", "instrutor"],
  },
  {
    title: "Sync marketing",
    description: "Campanhas e posts para redes sociais.",
    dayOffset: 1,
    startHour: 15,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    type: "reuniao",
    meetingLink: MEETING_LINKS[2],
    createdBy: "admin",
    participants: ["admin", "aluno"],
  },
  {
    title: "Conferir estoque de suplementos",
    description: "Inventário parcial do balcão.",
    dayOffset: 2,
    startHour: 7,
    startMinute: 30,
    endHour: 8,
    endMinute: 30,
    type: "tarefa",
    location: "Balcão",
    createdBy: "instrutor",
    participants: ["instrutor", "aluno"],
  },
  {
    title: "Reunião com fornecedor",
    description: "Negociação de equipamentos de musculação.",
    dayOffset: 2,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 0,
    type: "reuniao",
    meetingLink: MEETING_LINKS[3],
    createdBy: "admin",
    participants: ["admin", "instrutor"],
  },
  {
    title: "Renovação de contrato",
    description: "Assinatura de plano anual.",
    dayOffset: 2,
    startHour: 13,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    type: "compromisso",
    location: "Sala administrativa",
    createdBy: "admin",
    participants: ["admin", "aluno"],
  },
  {
    title: "Treino personalizado",
    description: "Sessão individual de acompanhamento.",
    dayOffset: 3,
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    type: "compromisso",
    location: "Sala 1 — Musculação",
    createdBy: "instrutor",
    participants: ["instrutor", "aluno"],
  },
  {
    title: "Revisar contratos pendentes",
    description: "Regularizar documentação de novos membros.",
    dayOffset: 3,
    startHour: 10,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    type: "tarefa",
    location: "Recepção",
    createdBy: "admin",
    participants: ["admin", "instrutor"],
  },
  {
    title: "Daily check-in",
    description: "Checkpoint rápido do time.",
    dayOffset: 3,
    startHour: 17,
    startMinute: 0,
    endHour: 17,
    endMinute: 30,
    type: "reuniao",
    meetingLink: MEETING_LINKS[5],
    createdBy: "instrutor",
    participants: ["admin", "instrutor", "aluno"],
  },
  {
    title: "Organizar arquivo de exames",
    description: "Digitalizar e classificar laudos médicos.",
    dayOffset: 4,
    startHour: 9,
    startMinute: 30,
    endHour: 10,
    endMinute: 30,
    type: "tarefa",
    location: "Arquivo",
    createdBy: "admin",
    participants: ["admin", "aluno"],
  },
  {
    title: "Entrega de uniformes",
    description: "Distribuição de camisetas da equipe.",
    dayOffset: 4,
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    type: "compromisso",
    location: "Vestiário",
    createdBy: "instrutor",
    participants: ["instrutor", "aluno"],
  },
  {
    title: "Treinamento da equipe",
    description: "Capacitação em atendimento ao cliente.",
    dayOffset: 4,
    startHour: 18,
    startMinute: 0,
    endHour: 19,
    endMinute: 0,
    type: "reuniao",
    meetingLink: MEETING_LINKS[6],
    createdBy: "admin",
    participants: ["admin", "instrutor"],
  },
  {
    title: "Avaliação nutricional",
    description: "Primeira consulta com nutricionista parceiro.",
    dayOffset: 5,
    startHour: 11,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    type: "compromisso",
    location: "Consultório 2",
    createdBy: "aluno",
    participants: ["admin", "aluno"],
  },
  {
    title: "Limpeza área externa",
    description: "Organização do pátio e estacionamento.",
    dayOffset: 5,
    startHour: 16,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    type: "tarefa",
    location: "Área externa",
    createdBy: "instrutor",
    participants: ["instrutor", "aluno"],
  },
  {
    title: "Planejamento da próxima semana",
    description: "Fechamento da semana e prioridades futuras.",
    dayOffset: 6,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    type: "reuniao",
    meetingLink: MEETING_LINKS[4],
    createdBy: "admin",
    participants: ["admin", "instrutor", "aluno"],
  },
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

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(base.getDate() + days);
  return date;
}

function buildTimestamp(date: Date, hour: number, minute: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00-03:00`;
}

function mapDatabaseError(message: string): string {
  if (
    (message.includes("events") || message.includes("event_participants")) &&
    message.includes("does not exist")
  ) {
    return "Tabelas da agenda não existem. Execute supabase/collaborative-agenda.sql no SQL Editor.";
  }

  return message;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function ensureSeedUsers(
  supabase: SupabaseClient,
): Promise<Map<SeedUserKey, SeedUser>> {
  const userByKey = new Map<SeedUserKey, SeedUser>();

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });

  if (listError) fail(`Erro ao listar usuários: ${listError.message}`);

  const existingByEmail = new Map(
    (listed.users ?? []).map((user) => [user.email?.toLowerCase(), user]),
  );

  for (const seedUser of SEED_USERS) {
    const existing = existingByEmail.get(seedUser.email.toLowerCase());

    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: seedUser.name,
          role: seedUser.role,
          seed: "agenda",
        },
      });

      if (error) fail(`Erro ao atualizar ${seedUser.email}: ${error.message}`);

      userByKey.set(seedUser.key, { ...seedUser, id: existing.id });
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      id: seedUser.id,
      email: seedUser.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: seedUser.name,
        role: seedUser.role,
        seed: "agenda",
      },
    });

    if (error || !data.user) {
      fail(`Erro ao criar ${seedUser.email}: ${error?.message ?? "usuário vazio"}`);
    }

    userByKey.set(seedUser.key, { ...seedUser, id: data.user.id });
  }

  return userByKey;
}

async function truncateAgendaTables(supabase: SupabaseClient) {
  const { error: participantsError } = await supabase
    .from("event_participants")
    .delete()
    .neq("event_id", "00000000-0000-0000-0000-000000000000");

  if (participantsError) {
    fail(mapDatabaseError(`Erro ao limpar event_participants: ${participantsError.message}`));
  }

  const { error: eventsError } = await supabase
    .from("events")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (eventsError) {
    fail(mapDatabaseError(`Erro ao limpar events: ${eventsError.message}`));
  }
}

async function seedEvents(
  supabase: SupabaseClient,
  users: Map<SeedUserKey, SeedUser>,
) {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);

  const eventRows = EVENTS_SEED.map((seed) => {
    const day = addDays(weekStart, seed.dayOffset);

    return {
      title: seed.title,
      description: seed.description,
      start_time: buildTimestamp(day, seed.startHour, seed.startMinute),
      end_time: buildTimestamp(day, seed.endHour, seed.endMinute),
      type: seed.type,
      meeting_link: seed.type === "reuniao" ? (seed.meetingLink ?? null) : null,
      location: seed.location ?? null,
      created_by: users.get(seed.createdBy)!.id,
    };
  });

  const { data: insertedEvents, error: eventsError } = await supabase
    .from("events")
    .insert(eventRows)
    .select("id");

  if (eventsError) {
    fail(mapDatabaseError(`Erro ao inserir eventos: ${eventsError.message}`));
  }

  if (!insertedEvents || insertedEvents.length !== EVENTS_SEED.length) {
    fail(`Esperado ${EVENTS_SEED.length} eventos, inseridos ${insertedEvents?.length ?? 0}.`);
  }

  const participantRows = insertedEvents.flatMap((event, index) => {
    const seed = EVENTS_SEED[index]!;
    const uniqueKeys = Array.from(new Set(seed.participants));

    if (uniqueKeys.length < 2) {
      fail(`Evento "${seed.title}" precisa de pelo menos 2 participantes.`);
    }

    return uniqueKeys.map((key) => ({
      event_id: event.id,
      user_id: users.get(key)!.id,
    }));
  });

  const { error: participantsError } = await supabase
    .from("event_participants")
    .insert(participantRows);

  if (participantsError) {
    fail(mapDatabaseError(`Erro ao inserir participantes: ${participantsError.message}`));
  }
}

function countVisibleEvents(userKey: SeedUserKey): number {
  return EVENTS_SEED.filter(
    (event) => event.createdBy === userKey || event.participants.includes(userKey),
  ).length;
}

function formatDayLabel(dayOffset: number): string {
  const date = addDays(new Date(), dayOffset);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
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

  console.log("→ Garantindo usuários de teste...");
  const users = await ensureSeedUsers(supabase);

  console.log("→ Limpando events e event_participants...");
  await truncateAgendaTables(supabase);

  console.log("→ Inserindo 20 eventos e participantes...");
  await seedEvents(supabase, users);

  const overlapDay = formatDayLabel(1);
  const typeCounts = EVENTS_SEED.reduce(
    (acc, event) => {
      acc[event.type] += 1;
      return acc;
    },
    { reuniao: 0, tarefa: 0, compromisso: 0 } as Record<EventType, number>,
  );

  console.log("");
  console.log("✓ Seed da agenda concluído.");
  console.log(`  Eventos: ${EVENTS_SEED.length} (próximos 7 dias a partir de hoje)`);
  console.log(
    `  Tipos: ${typeCounts.reuniao} reuniões, ${typeCounts.tarefa} tarefas, ${typeCounts.compromisso} compromissos`,
  );
  console.log(`  Conflitos: 3 eventos sobrepostos em ${overlapDay} das 09:00 às 10:00`);
  console.log("");
  console.log("Usuários de teste (senha para todos):");
  for (const user of SEED_USERS) {
    const resolved = users.get(user.key)!;
    console.log(`  • ${user.name} (${user.role})`);
    console.log(`    ${resolved.email}`);
  }
  console.log(`  Senha: ${SEED_PASSWORD}`);
  console.log("");
  console.log("Visibilidade esperada por usuário (RLS via event_participants):");
  for (const user of SEED_USERS) {
    console.log(`  • ${user.name}: ${countVisibleEvents(user.key)} eventos`);
  }
  console.log("");
  console.log("Validação visual:");
  console.log("  1. Acesse /agenda e faça login com cada usuário acima.");
  console.log(`  2. No dia ${overlapDay}, visualize a sobreposição dos 3 cards às 09:00.`);
  console.log("  3. Confirme que cada login mostra apenas eventos em que o usuário participa.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(`Falha inesperada: ${message}`);
});
