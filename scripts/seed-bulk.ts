/**
 * VitalFit Management — Seed de Alta Densidade (Stress Test)
 *
 * Gera volume crítico de dados para testar dashboards com carga pesada:
 *   • 100 membros fictícios (últimos 6 meses)
 *   • 5.000 check-ins (últimos 90 dias, picos 07h–09h e 17h–21h)
 *   • 1.000 transações financeiras (últimos 6 meses)
 *
 * Pré-requisitos (Supabase SQL Editor, nesta ordem):
 *   1. supabase/members.sql
 *   2. supabase/financial-categories.sql
 *   3. supabase/financial-transactions.sql
 *   4. supabase/gym-analytics.sql
 *
 * Variáveis no .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Execução:
 *   npm run seed:bulk
 *   npx tsx scripts/seed-bulk.ts
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

const BULK_EMAIL_DOMAIN = "@bulk.vitalfit.local";
const BULK_TX_PREFIX = "[BULK]";

const BATCH_SIZE = 500;
const MEMBER_COUNT = 100;
const CHECK_IN_COUNT = 5_000;
const TRANSACTION_COUNT = 1_000;

const PLAN_PRICES = {
  MENSAL_BASE: 89.9,
  TRIMESTRAL_PREMIUM: 229.9,
  ANUAL_PRO: 799.9,
} as const;

type MemberPlan = keyof typeof PLAN_PRICES;
type MemberOrigin = "ACADEMIA" | "GYMPASS" | "TOTALPASS";
type PaymentMethod = "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "DINHEIRO" | "BOLETO";

const PLANS: MemberPlan[] = ["MENSAL_BASE", "TRIMESTRAL_PREMIUM", "ANUAL_PRO"];
const ORIGINS: MemberOrigin[] = ["ACADEMIA", "GYMPASS", "TOTALPASS"];
const PAYMENT_METHODS: PaymentMethod[] = [
  "PIX",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "DINHEIRO",
  "BOLETO",
];

const FIRST_NAMES = [
  "Ana", "Bruno", "Camila", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique",
  "Isabela", "João", "Karina", "Lucas", "Mariana", "Nicolas", "Olivia", "Paulo",
  "Rafaela", "Samuel", "Tatiana", "Vinícius", "Amanda", "Bernardo", "Clara", "Daniel",
  "Elisa", "Fábio", "Giovana", "Hugo", "Iara", "Júlia", "Kauê", "Larissa", "Mateus",
  "Natália", "Otávio", "Patrícia", "Renato", "Sofia", "Thiago", "Úrsula", "Victor",
  "Wesley", "Yasmin", "Zeca", "Alice", "Breno", "Carolina", "Davi", "Ester", "Gustavo",
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Ferreira",
  "Alves", "Ribeiro", "Gomes", "Martins", "Carvalho", "Araújo", "Melo", "Barbosa",
  "Rocha", "Dias", "Nunes", "Mendes", "Freitas", "Cardoso", "Correia", "Teixeira",
  "Moreira", "Cavalcanti", "Monteiro", "Pinto", "Castro", "Ramos", "Vieira", "Lopes",
  "Farias", "Cunha", "Machado", "Andrade", "Batista", "Campos", "Duarte", "Fonseca",
  "Guimarães", "Henriques", "Junqueira", "Klein", "Leite", "Moraes", "Neves", "Ortega",
  "Prado", "Queiroz",
];

const EXPENSE_TEMPLATES = [
  { category: "SALARIO", descriptions: ["Folha — recepção", "Folha — personal trainers", "Folha — limpeza", "Folha — manutenção"] },
  { category: "MARKETING", descriptions: ["Campanha Instagram", "Google Ads", "Panfletagem bairro", "Influencer local"] },
  { category: "OPERACIONAL", descriptions: ["Energia e água", "Internet e telefone", "Produtos de limpeza", "Manutenção ar-condicionado"] },
  { category: "EQUIPAMENTO", descriptions: ["Halteres e anilhas", "Esteira nova", "Kit elásticos", "Manutenção bicicletas"] },
] as const;

const FIXED_CATEGORIES = [
  { legacy: "MENSALIDADE", name: "Mensalidade", type: "RECEITA" as const, color: "#22C55E", is_system: true },
  { legacy: "EQUIPAMENTO", name: "Equipamentos", type: "DESPESA" as const, color: "#FF7A00", is_system: false },
  { legacy: "SALARIO", name: "Salários", type: "DESPESA" as const, color: "#FF4D3D", is_system: false },
  { legacy: "MARKETING", name: "Marketing", type: "DESPESA" as const, color: "#FFB300", is_system: false },
  { legacy: "OPERACIONAL", name: "Operacional", type: "DESPESA" as const, color: "#F97316", is_system: false },
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

function daysAgo(days: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function randomBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
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

/** Hora com peso maior nos picos 07h–09h e 17h–21h (horário local BRT, UTC-3). */
function randomCheckInHour(): number {
  const roll = Math.random();
  if (roll < 0.4) return randomBetween(7, 9);
  if (roll < 0.8) return randomBetween(17, 21);
  if (roll < 0.9) return randomBetween(10, 13);
  return randomBetween(14, 16);
}

function buildCheckedAt(day: Date, hour: number, minute: number): string {
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:00-03:00`;
}

function buildMemberName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]!;
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]!;
  return `${first} ${last}`;
}

// ---------------------------------------------------------------------------
// Limpeza radical
// ---------------------------------------------------------------------------

async function truncateTables(supabase: SupabaseClient) {
  console.log("→ Limpeza radical (truncate lógico)…");

  const { error: txError } = await supabase
    .from("financial_transactions")
    .delete()
    .gte("transaction_date", "1970-01-01");

  if (txError) {
    if (txError.message.includes("Could not find the table")) {
      fail("Tabela financial_transactions não existe. Execute supabase/financial-transactions.sql.");
    }
    fail(`Erro ao truncar financial_transactions: ${txError.message}`);
  }

  const { error: checkInsError } = await supabase
    .from("check_ins")
    .delete()
    .gte("checked_at", "1970-01-01T00:00:00Z");

  if (checkInsError) {
    if (checkInsError.message.includes("Could not find the table")) {
      fail("Tabela check_ins não existe. Execute supabase/gym-analytics.sql.");
    }
    fail(`Erro ao truncar check_ins: ${checkInsError.message}`);
  }

  const { error: deleteMembersError } = await supabase
    .from("members")
    .delete()
    .like("email", `%${BULK_EMAIL_DOMAIN}`);

  if (deleteMembersError) fail(`Erro ao limpar membros bulk anteriores: ${deleteMembersError.message}`);

  console.log("  check_ins e financial_transactions zerados; membros bulk anteriores removidos");
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

type CategoryMap = Record<string, string>;

async function upsertCategories(supabase: SupabaseClient): Promise<CategoryMap> {
  console.log("→ Garantindo categorias financeiras…");

  const { error } = await supabase.from("financial_categories").upsert(
    FIXED_CATEGORIES.map((cat) => ({
      name: cat.name,
      type: cat.type,
      color: cat.color,
      is_system: cat.is_system,
    })),
    { onConflict: "name,type", ignoreDuplicates: false },
  );

  if (error) {
    if (error.message.includes("Could not find the table")) {
      fail("Tabela financial_categories não existe. Execute supabase/financial-categories.sql.");
    }
    fail(`Erro ao inserir categorias: ${error.message}`);
  }

  const { data, error: fetchError } = await supabase
    .from("financial_categories")
    .select("id, name, type")
    .in(
      "name",
      FIXED_CATEGORIES.map((c) => c.name),
    );

  if (fetchError) fail(`Erro ao buscar categorias: ${fetchError.message}`);

  const map: CategoryMap = {};
  for (const row of data ?? []) {
    const legacy = FIXED_CATEGORIES.find((c) => c.name === row.name && c.type === row.type)?.legacy;
    if (legacy) map[legacy] = row.id as string;
  }

  for (const cat of FIXED_CATEGORIES) {
    if (!map[cat.legacy]) {
      fail(`Categoria obrigatória ausente: ${cat.legacy} (${cat.name})`);
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Membros — 100 registros nos últimos 6 meses
// ---------------------------------------------------------------------------

type MemberSeed = {
  full_name: string;
  email: string;
  cpf: string;
  birth_date: string;
  origin: MemberOrigin;
  plan: MemberPlan;
  status: boolean;
  payment_status: boolean;
  created_at: string;
  last_payment_date: string | null;
  next_due_date: string | null;
  last_payment_method: PaymentMethod | null;
};

function buildMembersSeed(): MemberSeed[] {
  const members: MemberSeed[] = [];
  const sixMonthsDays = 180;

  for (let i = 0; i < MEMBER_COUNT; i += 1) {
    const slot = String(i + 1).padStart(3, "0");
    const isActive = i % 7 !== 0;
    const paid = isActive && i % 4 !== 0;
    const createdAt = daysAgo(randomBetween(1, sixMonthsDays));
    const lastPayment = paid ? daysAgo(randomBetween(1, 25)) : null;
    const plan = randomPick(PLANS);

    let nextDue: Date | null = null;
    if (lastPayment) {
      nextDue = new Date(lastPayment);
      if (plan === "MENSAL_BASE") nextDue.setMonth(nextDue.getMonth() + 1);
      else if (plan === "TRIMESTRAL_PREMIUM") nextDue.setMonth(nextDue.getMonth() + 3);
      else nextDue.setFullYear(nextDue.getFullYear() + 1);
    } else if (isActive) {
      nextDue = daysAgo(-randomBetween(3, 15));
    }

    const birthYear = 1975 + (i % 30);

    members.push({
      full_name: buildMemberName(i),
      email: `bulk${slot}${BULK_EMAIL_DOMAIN}`,
      cpf: String(80000000000 + i + 1).padStart(11, "0"),
      birth_date: `${birthYear}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      origin: randomPick(ORIGINS),
      plan,
      status: isActive,
      payment_status: paid,
      created_at: createdAt.toISOString(),
      last_payment_date: lastPayment ? toIsoDate(lastPayment) : null,
      next_due_date: nextDue ? toIsoDate(nextDue) : null,
      last_payment_method: paid ? randomPick(PAYMENT_METHODS) : null,
    });
  }

  return members;
}

type InsertedMember = {
  id: string;
  full_name: string;
  plan: MemberPlan;
  status: boolean;
};

async function insertMembersBatched(supabase: SupabaseClient): Promise<InsertedMember[]> {
  console.log(`→ Inserindo ${MEMBER_COUNT} membros (batch ${BATCH_SIZE})…`);

  const payload = buildMembersSeed();
  const inserted: InsertedMember[] = [];

  for (const chunk of chunkArray(payload, BATCH_SIZE)) {
    const { data, error } = await supabase
      .from("members")
      .insert(chunk)
      .select("id, full_name, plan, status");

    if (error) {
      if (error.message.includes("Could not find the table")) {
        fail("Tabela members não existe. Execute supabase/members.sql.");
      }
      fail(`Erro ao inserir membros: ${error.message}`);
    }

    inserted.push(...((data ?? []) as InsertedMember[]));
  }

  const active = inserted.filter((m) => m.status).length;
  console.log(`  ${inserted.length} membros inseridos (${active} ativos)`);
  return inserted;
}

// ---------------------------------------------------------------------------
// Check-ins — 5.000 registros nos últimos 90 dias
// ---------------------------------------------------------------------------

type CheckInInsert = {
  member_id: string;
  checked_at: string;
  class_id?: string;
};

async function fetchClassIds(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase.from("classes").select("id");

  if (error) {
    if (error.message.includes("Could not find the table")) return [];
    fail(`Erro ao buscar classes: ${error.message}`);
  }

  return (data ?? []).map((row) => row.id as string);
}

function buildCheckIns(members: InsertedMember[], classIds: string[]): CheckInInsert[] {
  const activeMembers = members.filter((m) => m.status);
  if (activeMembers.length === 0) fail("Nenhum membro ativo para gerar check-ins.");

  const checkIns: CheckInInsert[] = [];

  for (let i = 0; i < CHECK_IN_COUNT; i += 1) {
    const member = randomPick(activeMembers);
    const day = daysAgo(randomBetween(0, 89));
    const hour = randomCheckInHour();

    checkIns.push({
      member_id: member.id,
      checked_at: buildCheckedAt(day, hour, randomBetween(0, 59)),
      ...(classIds.length > 0 ? { class_id: randomPick(classIds) } : {}),
    });
  }

  return checkIns;
}

async function insertCheckInsBatched(
  supabase: SupabaseClient,
  members: InsertedMember[],
  classIds: string[],
) {
  console.log(`→ Inserindo ${CHECK_IN_COUNT} check-ins (batch ${BATCH_SIZE})…`);

  const payload = buildCheckIns(members, classIds);
  let inserted = 0;

  for (const chunk of chunkArray(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("check_ins").insert(chunk);
    if (error) fail(`Erro ao inserir check-ins (lote ${inserted / BATCH_SIZE + 1}): ${error.message}`);
    inserted += chunk.length;
    process.stdout.write(`  lote ${inserted / BATCH_SIZE}/${Math.ceil(payload.length / BATCH_SIZE)} — ${inserted} registros\r`);
  }

  const morningPeak = payload.filter((row) => {
    const hour = new Date(row.checked_at).getHours();
    return hour >= 7 && hour <= 9;
  }).length;

  const eveningPeak = payload.filter((row) => {
    const hour = new Date(row.checked_at).getHours();
    return hour >= 17 && hour <= 21;
  }).length;

  console.log(`\n  ${payload.length} check-ins (${morningPeak} no pico 07h–09h, ${eveningPeak} no pico 17h–21h)`);
}

// ---------------------------------------------------------------------------
// Transações — 1.000 registros nos últimos 6 meses
// ---------------------------------------------------------------------------

type TransactionInsert = {
  member_id: string | null;
  description: string;
  amount: number;
  type: "RECEITA" | "DESPESA";
  category_id: string;
  payment_method: PaymentMethod;
  transaction_date: string;
};

function randomDateInLastMonths(months: number): string {
  const maxDays = months * 30;
  return toIsoDate(daysAgo(randomBetween(0, maxDays)));
}

function buildFinancialTransactions(
  members: InsertedMember[],
  categories: CategoryMap,
): TransactionInsert[] {
  const transactions: TransactionInsert[] = [];
  const activeMembers = members.filter((m) => m.status);

  const receitaTarget = Math.round(TRANSACTION_COUNT * 0.65);
  const despesaTarget = TRANSACTION_COUNT - receitaTarget;

  for (let i = 0; i < receitaTarget; i += 1) {
    const member = randomPick(activeMembers);
    transactions.push({
      member_id: null,
      description: `${BULK_TX_PREFIX} Mensalidade — ${member.full_name}`,
      amount: PLAN_PRICES[member.plan],
      type: "RECEITA",
      category_id: categories.MENSALIDADE!,
      payment_method: randomPick(PAYMENT_METHODS),
      transaction_date: randomDateInLastMonths(6),
    });
  }

  for (let i = 0; i < despesaTarget; i += 1) {
    const template = randomPick(EXPENSE_TEMPLATES);
    const description = randomPick(template.descriptions);
    const amountRanges: Record<string, [number, number]> = {
      SALARIO: [1500, 9000],
      MARKETING: [300, 1200],
      OPERACIONAL: [400, 2500],
      EQUIPAMENTO: [500, 6000],
    };

    const [min, max] = amountRanges[template.category] ?? [100, 1000];

    transactions.push({
      member_id: null,
      description: `${BULK_TX_PREFIX} ${description}`,
      amount: randomBetween(min, max),
      type: "DESPESA",
      category_id: categories[template.category]!,
      payment_method: randomPick(PAYMENT_METHODS),
      transaction_date: randomDateInLastMonths(6),
    });
  }

  return transactions;
}

async function insertFinancialTransactionsBatched(
  supabase: SupabaseClient,
  members: InsertedMember[],
  categories: CategoryMap,
) {
  console.log(`→ Inserindo ${TRANSACTION_COUNT} transações (batch ${BATCH_SIZE})…`);

  const payload = buildFinancialTransactions(members, categories);
  let inserted = 0;

  for (const chunk of chunkArray(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("financial_transactions").insert(chunk);
    if (error) fail(`Erro ao inserir transações (lote ${inserted / BATCH_SIZE + 1}): ${error.message}`);
    inserted += chunk.length;
    process.stdout.write(`  lote ${inserted / BATCH_SIZE}/${Math.ceil(payload.length / BATCH_SIZE)} — ${inserted} registros\r`);
  }

  const receitas = payload.filter((t) => t.type === "RECEITA").length;
  const despesas = payload.filter((t) => t.type === "DESPESA").length;
  console.log(`\n  ${payload.length} transações (${receitas} receitas, ${despesas} despesas)`);
}

// ---------------------------------------------------------------------------
// Gym settings
// ---------------------------------------------------------------------------

async function ensureGymSettings(supabase: SupabaseClient) {
  const { count, error: countError } = await supabase
    .from("gym_settings")
    .select("id", { count: "exact", head: true });

  if (countError) {
    if (countError.message.includes("Could not find the table")) {
      fail("Tabela gym_settings não existe. Execute supabase/gym-analytics.sql.");
    }
    fail(`Erro ao verificar gym_settings: ${countError.message}`);
  }

  if ((count ?? 0) === 0) {
    const { error } = await supabase.from("gym_settings").insert({
      max_capacity: 100,
      peak_start: 17,
      peak_end: 21,
    });
    if (error) fail(`Erro ao inserir gym_settings: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Verificação final
// ---------------------------------------------------------------------------

async function printFinalCounts(supabase: SupabaseClient, bulkMemberIds: string[]) {
  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .like("email", `%${BULK_EMAIL_DOMAIN}`);

  const { count: checkInCount } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true })
    .in("member_id", bulkMemberIds);

  const { count: txCount } = await supabase
    .from("financial_transactions")
    .select("id", { count: "exact", head: true })
    .like("description", `${BULK_TX_PREFIX}%`);

  const { count: totalCheckIns } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true });

  const { count: totalTransactions } = await supabase
    .from("financial_transactions")
    .select("id", { count: "exact", head: true });

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  VERIFICAÇÃO FINAL — contagem por tabela");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  members (bulk):              ${memberCount ?? 0} / ${MEMBER_COUNT}`);
  console.log(`  check_ins (bulk):            ${checkInCount ?? 0} / ${CHECK_IN_COUNT}`);
  console.log(`  financial_transactions (bulk): ${txCount ?? 0} / ${TRANSACTION_COUNT}`);
  console.log("───────────────────────────────────────────────────────");
  console.log(`  check_ins (total na tabela): ${totalCheckIns ?? 0}`);
  console.log(`  financial_transactions (total): ${totalTransactions ?? 0}`);
  console.log("═══════════════════════════════════════════════════════\n");
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

  console.log("\n🏋️  VitalFit — Seed de Alta Densidade (Stress Test)\n");

  await truncateTables(supabase);
  await ensureGymSettings(supabase);

  const categories = await upsertCategories(supabase);
  const members = await insertMembersBatched(supabase);
  const classIds = await fetchClassIds(supabase);

  await insertCheckInsBatched(supabase, members, classIds);
  await insertFinancialTransactionsBatched(supabase, members, categories);

  await printFinalCounts(
    supabase,
    members.map((m) => m.id),
  );

  console.log("✓ Stress seed concluído! Abra /dashboard e /finance para validar performance.");
  console.log("  Reexecute com: npm run seed:bulk\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(`Falha inesperada: ${message}`);
});
