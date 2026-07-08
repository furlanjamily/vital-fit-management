/**
 * Seed de teste: profissionais + vínculos members.professional_id
 *
 * Uso: npm run seed:test-flow
 *
 * Pré-requisitos:
 * - .env com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 * - Tabelas members e professionals criadas (supabase/*.sql)
 * - Alunos de exemplo (npm run seed:members)
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const vars = {};

  try {
    const content = readFileSync(resolve(root, ".env"), "utf8");
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

const PROFESSIONALS_SEED = [
  {
    id: "a1111111-1111-4111-8111-111111111101",
    full_name: "Rafael Mendes",
    email: "rafael.mendes@vitalfit.com",
    cref: "123456-G/SP",
    birth_date: "1990-03-15",
    gender: "Male",
    shift: "Morning",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=96&q=80",
  },
  {
    id: "a2222222-2222-4222-8222-222222222202",
    full_name: "Camila Rocha",
    email: "camila.rocha@vitalfit.com",
    cref: "234567-G/SP",
    birth_date: "1992-07-22",
    gender: "Female",
    shift: "Afternoon",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&q=80",
  },
  {
    id: "a3333333-3333-4333-8333-333333333303",
    full_name: "Diego Ferreira",
    email: "diego.ferreira@vitalfit.com",
    cref: "345678-G/RJ",
    birth_date: "1988-11-08",
    gender: "Male",
    shift: "Night",
    status: true,
    avatar_url: null,
  },
  {
    id: "a4444444-4444-4444-8444-444444444404",
    full_name: "Paulo Souza",
    email: "paulo.souza@vitalfit.com",
    cref: "456789-G/MG",
    birth_date: "1985-01-30",
    gender: "Male",
    shift: "Morning",
    status: false,
    avatar_url: null,
  },
];

const MEMBER_ASSIGNMENTS = [
  {
    professionalEmail: "rafael.mendes@vitalfit.com",
    memberEmails: [
      "bessie.cooper@email.com",
      "jerome.bell@email.com",
      "theresa.webb@email.com",
      "ana.ribeiro@email.com",
      "carlos.lima@email.com",
    ],
  },
  {
    professionalEmail: "camila.rocha@vitalfit.com",
    memberEmails: [
      "fernanda.souza@email.com",
      "ricardo.alves@email.com",
      "pedro.costa@email.com",
      "camila.duarte@email.com",
    ],
  },
  {
    professionalEmail: "diego.ferreira@vitalfit.com",
    memberEmails: [
      "lucas.ferreira@email.com",
      "beatriz.nunes@email.com",
      "larissa.oliveira@email.com",
    ],
  },
  {
    professionalEmail: "paulo.souza@vitalfit.com",
    memberEmails: ["juliana.martins@email.com"],
  },
];

const UNASSIGNED_MEMBER_EMAILS = [
  "marvin.mckinney@email.com",
  "gabriel.santos@email.com",
  "thiago.mendes@email.com",
  "patricia.gomes@email.com",
  "bruno.carvalho@email.com",
];

const { url, serviceRoleKey } = loadEnv();

if (!url || !serviceRoleKey) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function fail(message) {
  console.error(message);
  process.exit(1);
}

const { data: professionals, error: professionalsError } = await supabase
  .from("professionals")
  .upsert(PROFESSIONALS_SEED, { onConflict: "email" })
  .select("id, email, full_name, status");

if (professionalsError) {
  if (professionalsError.message.includes("Could not find the table")) {
    fail(
      "Tabela professionals não existe. Execute supabase/professionals.sql no Supabase primeiro.",
    );
  }
  fail(`Erro ao inserir profissionais: ${professionalsError.message}`);
}

const professionalIdByEmail = new Map(
  (professionals ?? []).map((row) => [row.email, row.id]),
);

for (const assignment of MEMBER_ASSIGNMENTS) {
  const professionalId = professionalIdByEmail.get(assignment.professionalEmail);

  if (!professionalId) {
    fail(`Profissional não encontrado: ${assignment.professionalEmail}`);
  }

  const { error } = await supabase
    .from("members")
    .update({ professional_id: professionalId })
    .in("email", assignment.memberEmails);

  if (error) {
    fail(`Erro ao vincular alunos a ${assignment.professionalEmail}: ${error.message}`);
  }
}

const { error: unassignError } = await supabase
  .from("members")
  .update({ professional_id: null })
  .in("email", UNASSIGNED_MEMBER_EMAILS);

if (unassignError) {
  fail(`Erro ao remover vínculos: ${unassignError.message}`);
}

const { count: memberCount, error: memberCountError } = await supabase
  .from("members")
  .select("*", { count: "exact", head: true });

if (memberCountError) {
  fail(`Seed aplicado, mas falhou ao contar alunos: ${memberCountError.message}`);
}

const { count: unassignedCount, error: unassignedError } = await supabase
  .from("members")
  .select("*", { count: "exact", head: true })
  .is("professional_id", null);

if (unassignedError) {
  fail(`Seed aplicado, mas falhou ao contar sem professor: ${unassignedError.message}`);
}

console.log("✓ Seed de teste concluído.");
console.log(`  Profissionais: ${professionals?.length ?? 0} (3 ativos, 1 inativo)`);
console.log(`  Total de alunos: ${memberCount ?? 0}`);
console.log(`  Alunos sem professor: ${unassignedCount ?? 0}`);
console.log("");
console.log("Teste em /members:");
console.log("  • Coluna Personal Trainer e filtro por trainer");
console.log("  • Editar Juliana Martins (profissional inativo)");
console.log("  • Alunos sem vínculo exibem Não atribuído");
