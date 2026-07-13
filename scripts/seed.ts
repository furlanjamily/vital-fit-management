/**
 * VitalFit Management — seed completo para dashboards e financeiro
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ONDE RODAR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pré-requisitos (Supabase SQL Editor, nesta ordem):
 *   1. supabase/members.sql
 *   2. supabase/financial-categories.sql
 *   3. supabase/financial-transactions.sql
 *   4. supabase/gym-analytics.sql
 *   5. supabase/vw-financial-transactions.sql
 *   6. supabase/members-payment-dates.sql  (trigger de mensalidade atualizado)
 *
 * Variáveis no .env (raiz do projeto):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Execução (na raiz do projeto):
 *   npm run seed
 *
 * Alternativas equivalentes:
 *   npx tsx scripts/seed.ts
 *   npx ts-node --esm scripts/seed.ts   (requer ts-node instalado)
 *
 * O script é IDEMPOTENTE: limpa dados anteriores marcados com @seed.vitalfit.local
 * antes de reinserir. Pode rodar quantas vezes quiser.
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

const SEED_EMAIL_DOMAIN = "@seed.vitalfit.local";
const SEED_TX_PREFIX = "[SEED]";

const PLAN_PRICES = {
  MENSAL_BASE: 89.9,
  TRIMESTRAL_PREMIUM: 229.9,
  ANUAL_PRO: 799.9,
} as const;

type MemberPlan = keyof typeof PLAN_PRICES;
type MemberOrigin = "ACADEMIA" | "GYMPASS" | "TOTALPASS";
type PaymentMethod = "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "DINHEIRO" | "BOLETO";

const PAYMENT_METHODS: PaymentMethod[] = [
  "PIX",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "DINHEIRO",
  "BOLETO",
];

/** 5 categorias fixas do ecossistema (legado → financial_categories). */
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

/** Hora com peso maior no pico 17h–20h (horário local BRT, UTC-3). */
function randomCheckInHour(): number {
  const roll = Math.random();
  if (roll < 0.55) return randomBetween(17, 20);
  if (roll < 0.72) return randomBetween(6, 9);
  if (roll < 0.86) return randomBetween(10, 13);
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

// ---------------------------------------------------------------------------
// Dados fictícios — 20 alunos
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

const MEMBER_PROFILES: Omit<MemberSeed, "email" | "cpf" | "birth_date" | "created_at" | "last_payment_date" | "next_due_date" | "last_payment_method" | "payment_status">[] = [
  { full_name: "Ana Clara Mendes", origin: "ACADEMIA", plan: "MENSAL_BASE", status: true },
  { full_name: "Bruno Henrique Silva", origin: "GYMPASS", plan: "TRIMESTRAL_PREMIUM", status: true },
  { full_name: "Camila Rocha", origin: "TOTALPASS", plan: "MENSAL_BASE", status: true },
  { full_name: "Diego Ferreira", origin: "ACADEMIA", plan: "ANUAL_PRO", status: true },
  { full_name: "Eduarda Lima", origin: "GYMPASS", plan: "MENSAL_BASE", status: false },
  { full_name: "Felipe Nunes", origin: "ACADEMIA", plan: "TRIMESTRAL_PREMIUM", status: true },
  { full_name: "Gabriela Souza", origin: "TOTALPASS", plan: "MENSAL_BASE", status: true },
  { full_name: "Henrique Alves", origin: "GYMPASS", plan: "ANUAL_PRO", status: true },
  { full_name: "Isabela Costa", origin: "ACADEMIA", plan: "MENSAL_BASE", status: true },
  { full_name: "João Pedro Santos", origin: "GYMPASS", plan: "TRIMESTRAL_PREMIUM", status: false },
  { full_name: "Karina Duarte", origin: "TOTALPASS", plan: "MENSAL_BASE", status: true },
  { full_name: "Lucas Martins", origin: "ACADEMIA", plan: "MENSAL_BASE", status: true },
  { full_name: "Mariana Oliveira", origin: "GYMPASS", plan: "ANUAL_PRO", status: true },
  { full_name: "Nicolas Barbosa", origin: "ACADEMIA", plan: "TRIMESTRAL_PREMIUM", status: true },
  { full_name: "Olivia Pereira", origin: "TOTALPASS", plan: "MENSAL_BASE", status: false },
  { full_name: "Paulo Carvalho", origin: "GYMPASS", plan: "MENSAL_BASE", status: true },
  { full_name: "Rafaela Gomes", origin: "ACADEMIA", plan: "TRIMESTRAL_PREMIUM", status: true },
  { full_name: "Samuel Ribeiro", origin: "TOTALPASS", plan: "ANUAL_PRO", status: true },
  { full_name: "Tatiana Freitas", origin: "GYMPASS", plan: "MENSAL_BASE", status: false },
  { full_name: "Vinícius Araújo", origin: "ACADEMIA", plan: "MENSAL_BASE", status: true },
];

/** Dias desde o cadastro — espalhados nos últimos ~6 meses para métricas de novos alunos. */
const CREATED_AT_OFFSETS = [3, 7, 12, 18, 25, 32, 41, 48, 55, 63, 72, 81, 95, 108, 120, 135, 150, 165, 178, 190];

function buildMembersSeed(): MemberSeed[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return MEMBER_PROFILES.map((profile, index) => {
    const slot = String(index + 1).padStart(2, "0");
    const email = `aluno${slot}${SEED_EMAIL_DOMAIN}`;
    const cpf = String(70000000000 + index + 1).padStart(11, "0");
    const createdAt = daysAgo(CREATED_AT_OFFSETS[index] ?? index * 10);
    const isActive = profile.status;
    const paid = isActive && index % 3 !== 0;

    const lastPayment = paid ? daysAgo(randomBetween(1, 20)) : null;
    const nextDue = paid
      ? new Date(lastPayment!)
      : isActive
        ? daysAgo(-randomBetween(3, 12))
        : null;

    if (nextDue && lastPayment) {
      if (profile.plan === "MENSAL_BASE") nextDue.setMonth(nextDue.getMonth() + 1);
      else if (profile.plan === "TRIMESTRAL_PREMIUM") nextDue.setMonth(nextDue.getMonth() + 3);
      else nextDue.setFullYear(nextDue.getFullYear() + 1);
    }

    const birthYear = 1985 + (index % 18);

    return {
      ...profile,
      email,
      cpf,
      birth_date: `${birthYear}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
      payment_status: paid,
      created_at: createdAt.toISOString(),
      last_payment_date: lastPayment ? toIsoDate(lastPayment) : null,
      next_due_date: nextDue ? toIsoDate(nextDue) : null,
      last_payment_method: paid ? randomPick(PAYMENT_METHODS) : null,
    };
  });
}

// ---------------------------------------------------------------------------
// Limpeza idempotente
// ---------------------------------------------------------------------------

async function clearPreviousSeed(supabase: SupabaseClient) {
  console.log("→ Limpando seed anterior…");

  const { data: seedMembers, error: membersError } = await supabase
    .from("members")
    .select("id")
    .like("email", `%${SEED_EMAIL_DOMAIN}`);

  if (membersError) fail(`Erro ao buscar alunos seed: ${membersError.message}`);

  const memberIds = (seedMembers ?? []).map((row) => row.id as string);

  if (memberIds.length > 0) {
    const { error: checkInsError } = await supabase
      .from("check_ins")
      .delete()
      .in("member_id", memberIds);

    if (checkInsError) fail(`Erro ao limpar check_ins: ${checkInsError.message}`);

    const { error: memberTxError } = await supabase
      .from("financial_transactions")
      .delete()
      .in("member_id", memberIds);

    if (memberTxError) fail(`Erro ao limpar transações de alunos: ${memberTxError.message}`);
  }

  const { error: seedTxError } = await supabase
    .from("financial_transactions")
    .delete()
    .like("description", `${SEED_TX_PREFIX}%`);

  if (seedTxError) fail(`Erro ao limpar transações seed: ${seedTxError.message}`);

  const { error: deleteMembersError } = await supabase
    .from("members")
    .delete()
    .like("email", `%${SEED_EMAIL_DOMAIN}`);

  if (deleteMembersError) fail(`Erro ao limpar alunos seed: ${deleteMembersError.message}`);

  console.log(`  Removidos: ${memberIds.length} alunos e dados vinculados`);
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

type CategoryMap = Record<string, string>;

async function upsertCategories(supabase: SupabaseClient): Promise<CategoryMap> {
  console.log("→ Inserindo categorias fixas…");

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
      fail(`Categoria obrigatória ausente após upsert: ${cat.legacy} (${cat.name})`);
    }
  }

  console.log(`  ${FIXED_CATEGORIES.length} categorias validadas`);
  return map;
}

// ---------------------------------------------------------------------------
// Alunos
// ---------------------------------------------------------------------------

type InsertedMember = {
  id: string;
  full_name: string;
  plan: MemberPlan;
  status: boolean;
};

async function insertMembers(supabase: SupabaseClient): Promise<InsertedMember[]> {
  console.log("→ Inserindo 20 alunos…");

  const payload = buildMembersSeed();
  const { data, error } = await supabase.from("members").insert(payload).select("id, full_name, plan, status");

  if (error) {
    if (error.message.includes("Could not find the table")) {
      fail("Tabela members não existe. Execute supabase/members.sql.");
    }
    fail(`Erro ao inserir alunos: ${error.message}`);
  }

  const members = (data ?? []) as InsertedMember[];
  const active = members.filter((m) => m.status).length;
  const inactive = members.length - active;

  console.log(`  ${members.length} alunos (${active} ativos, ${inactive} inativos)`);
  return members;
}

// ---------------------------------------------------------------------------
// Transações financeiras (últimos 3 meses)
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

function buildFinancialTransactions(
  members: InsertedMember[],
  categories: CategoryMap,
): TransactionInsert[] {
  const transactions: TransactionInsert[] = [];
  const activeMembers = members.filter((m) => m.status);

  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    const monthAnchor = daysAgo(monthOffset * 30 + 5);

    for (const member of activeMembers) {
      const payDay = randomBetween(1, 28);
      const payDate = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), payDay);
      const amount = PLAN_PRICES[member.plan];

      // member_id omitido nas receitas seed: evita trigger legado (category) em bancos
      // sem members-payment-dates.sql. Campos de pagamento já vêm no insert de members.
      transactions.push({
        member_id: null,
        description: `${SEED_TX_PREFIX} Mensalidade — ${member.full_name}`,
        amount,
        type: "RECEITA",
        category_id: categories.MENSALIDADE!,
        payment_method: randomPick(PAYMENT_METHODS),
        transaction_date: toIsoDate(payDate),
      });
    }

    const salaryDay = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 5);
    const salaries = [
      { desc: "Folha — recepção", amount: 2200 },
      { desc: "Folha — personal trainers (3)", amount: 8400 },
      { desc: "Folha — limpeza", amount: 1800 },
    ];

    for (const salary of salaries) {
      transactions.push({
        member_id: null,
        description: `${SEED_TX_PREFIX} ${salary.desc}`,
        amount: salary.amount,
        type: "DESPESA",
        category_id: categories.SALARIO!,
        payment_method: "PIX",
        transaction_date: toIsoDate(salaryDay),
      });
    }

    transactions.push({
      member_id: null,
      description: `${SEED_TX_PREFIX} Campanha Instagram — mês ${monthAnchor.getMonth() + 1}`,
      amount: randomBetween(450, 900),
      type: "DESPESA",
      category_id: categories.MARKETING!,
      payment_method: randomPick(["PIX", "CARTAO_CREDITO"] as const),
      transaction_date: toIsoDate(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 12)),
    });

    transactions.push({
      member_id: null,
      description: `${SEED_TX_PREFIX} Energia e água`,
      amount: randomBetween(1200, 2100),
      type: "DESPESA",
      category_id: categories.OPERACIONAL!,
      payment_method: "BOLETO",
      transaction_date: toIsoDate(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 8)),
    });

    transactions.push({
      member_id: null,
      description: `${SEED_TX_PREFIX} Manutenção ar-condicionado`,
      amount: randomBetween(350, 650),
      type: "DESPESA",
      category_id: categories.OPERACIONAL!,
      payment_method: "PIX",
      transaction_date: toIsoDate(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 20)),
    });

    if (monthOffset < 2) {
      transactions.push({
        member_id: null,
        description: `${SEED_TX_PREFIX} Halteres e anilhas`,
        amount: randomBetween(2800, 5200),
        type: "DESPESA",
        category_id: categories.EQUIPAMENTO!,
        payment_method: "CARTAO_CREDITO",
        transaction_date: toIsoDate(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 18)),
      });
    }
  }

  return transactions;
}

async function insertFinancialTransactions(
  supabase: SupabaseClient,
  members: InsertedMember[],
  categories: CategoryMap,
) {
  console.log("→ Gerando transações dos últimos 3 meses…");

  const payload = buildFinancialTransactions(members, categories);

  for (const chunk of chunkArray(payload, 100)) {
    const { error } = await supabase.from("financial_transactions").insert(chunk);
    if (error) {
      if (error.message.includes("Could not find the table")) {
        fail("Tabela financial_transactions não existe. Execute supabase/financial-transactions.sql.");
      }
      if (error.message.includes('has no field "category"')) {
        fail(
          "Trigger desatualizado em financial_transactions. Execute supabase/members-payment-dates.sql no SQL Editor.",
        );
      }
      fail(`Erro ao inserir transações: ${error.message}`);
    }
  }

  const receitas = payload.filter((t) => t.type === "RECEITA").length;
  const despesas = payload.filter((t) => t.type === "DESPESA").length;
  console.log(`  ${payload.length} transações (${receitas} receitas, ${despesas} despesas)`);
}

// ---------------------------------------------------------------------------
// Check-ins (últimos 30 dias, pico 17h–20h)
// ---------------------------------------------------------------------------

type CheckInInsert = {
  member_id: string;
  checked_at: string;
};

function buildCheckIns(members: InsertedMember[]): CheckInInsert[] {
  const checkIns: CheckInInsert[] = [];
  const activeMembers = members.filter((m) => m.status);

  for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
    const day = daysAgo(dayOffset);
    const weekday = day.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const attendanceRate = isWeekend ? 0.45 : 0.75;

    for (const member of activeMembers) {
      if (Math.random() > attendanceRate) continue;

      const visitsToday = dayOffset === 0 ? randomBetween(1, 2) : Math.random() < 0.12 ? 2 : 1;

      for (let visit = 0; visit < visitsToday; visit += 1) {
        const hour = dayOffset === 0 && visit === 0
          ? randomBetween(17, 20)
          : randomCheckInHour();

        checkIns.push({
          member_id: member.id,
          checked_at: buildCheckedAt(day, hour, randomBetween(0, 59)),
        });
      }
    }
  }

  return checkIns;
}

async function insertCheckIns(supabase: SupabaseClient, members: InsertedMember[]) {
  console.log("→ Gerando check-ins dos últimos 30 dias…");

  const payload = buildCheckIns(members);

  for (const chunk of chunkArray(payload, 200)) {
    const { error } = await supabase.from("check_ins").insert(chunk);
    if (error) {
      if (error.message.includes("Could not find the table")) {
        fail("Tabela check_ins não existe. Execute supabase/gym-analytics.sql.");
      }
      fail(`Erro ao inserir check-ins: ${error.message}`);
    }
  }

  const peakCount = payload.filter((row) => {
    const hour = new Date(row.checked_at).getHours();
    return hour >= 17 && hour <= 20;
  }).length;

  console.log(`  ${payload.length} check-ins (${peakCount} no pico 17h–20h)`);
}

// ---------------------------------------------------------------------------
// Gym settings (capacidade + janela de pico)
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
      peak_end: 20,
    });

    if (error) fail(`Erro ao inserir gym_settings: ${error.message}`);
    console.log("→ gym_settings criado (capacidade 100, pico 17h–20h)");
  }
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

  console.log("\n🏋️  VitalFit — seed de dados fictícios\n");

  await clearPreviousSeed(supabase);
  await ensureGymSettings(supabase);

  const categories = await upsertCategories(supabase);
  const members = await insertMembers(supabase);

  await insertFinancialTransactions(supabase, members, categories);
  await insertCheckIns(supabase, members);

  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .like("email", `%${SEED_EMAIL_DOMAIN}`);

  const { count: txCount } = await supabase
    .from("financial_transactions")
    .select("id", { count: "exact", head: true })
    .like("description", `${SEED_TX_PREFIX}%`);

  const activeIds = members.filter((m) => m.status).map((m) => m.id);
  const { count: checkInCount } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true })
    .in("member_id", activeIds);

  console.log("\n✓ Seed concluído com sucesso!\n");
  console.log("Resumo:");
  console.log(`  Alunos seed:        ${memberCount ?? 0}`);
  console.log(`  Transações seed:    ${txCount ?? 0}`);
  console.log(`  Check-ins (ativos): ${checkInCount ?? 0}`);
  console.log("\nDashboards prontos em /dashboard e /finance.");
  console.log("Reexecute com: npm run seed\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(`Falha inesperada: ${message}`);
});
