/**
 * Seed de alunos (public.members) via Supabase service role.
 *
 * Uso: npm run seed:members
 *
 * Pré-requisitos:
 * - .env com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 * - Tabela members criada (supabase/members.sql)
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

const MEMBERS_SEED = [
  {
    full_name: "Bessie Cooper",
    email: "bessie.cooper@email.com",
    cpf: "12345678901",
    birth_date: "2000-05-24",
    origin: "ACADEMIA",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
  },
  {
    full_name: "Jerome Bell",
    email: "jerome.bell@email.com",
    cpf: "98765432100",
    birth_date: "1995-08-15",
    origin: "GYMPASS",
    plan: "TRIMESTRAL_PREMIUM",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80",
  },
  {
    full_name: "Marvin McKinney",
    email: "marvin.mckinney@email.com",
    cpf: "45678912300",
    birth_date: "1992-11-02",
    origin: "TOTALPASS",
    plan: "ANUAL_PRO",
    status: false,
    avatar_url: null,
  },
  {
    full_name: "Theresa Webb",
    email: "theresa.webb@email.com",
    cpf: "32165498700",
    birth_date: "1998-01-30",
    origin: "ACADEMIA",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=96&q=80",
  },
  {
    full_name: "Ana Paula Ribeiro",
    email: "ana.ribeiro@email.com",
    cpf: "52998224725",
    birth_date: "1993-03-12",
    origin: "ACADEMIA",
    plan: "TRIMESTRAL_PREMIUM",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Carlos Eduardo Lima",
    email: "carlos.lima@email.com",
    cpf: "11144477735",
    birth_date: "1988-07-21",
    origin: "GYMPASS",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Fernanda Souza",
    email: "fernanda.souza@email.com",
    cpf: "22233344455",
    birth_date: "1999-11-08",
    origin: "TOTALPASS",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&q=80",
  },
  {
    full_name: "Ricardo Alves",
    email: "ricardo.alves@email.com",
    cpf: "33344455566",
    birth_date: "1990-04-17",
    origin: "ACADEMIA",
    plan: "ANUAL_PRO",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Juliana Martins",
    email: "juliana.martins@email.com",
    cpf: "44455566677",
    birth_date: "1996-09-03",
    origin: "GYMPASS",
    plan: "TRIMESTRAL_PREMIUM",
    status: false,
    avatar_url: null,
  },
  {
    full_name: "Pedro Henrique Costa",
    email: "pedro.costa@email.com",
    cpf: "55566677788",
    birth_date: "2001-12-25",
    origin: "ACADEMIA",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Camila Duarte",
    email: "camila.duarte@email.com",
    cpf: "66677788899",
    birth_date: "1994-06-14",
    origin: "TOTALPASS",
    plan: "ANUAL_PRO",
    status: true,
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80",
  },
  {
    full_name: "Lucas Ferreira",
    email: "lucas.ferreira@email.com",
    cpf: "77788899900",
    birth_date: "1987-02-28",
    origin: "GYMPASS",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Beatriz Nunes",
    email: "beatriz.nunes@email.com",
    cpf: "88899900011",
    birth_date: "2002-08-09",
    origin: "ACADEMIA",
    plan: "TRIMESTRAL_PREMIUM",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Gabriel Santos",
    email: "gabriel.santos@email.com",
    cpf: "99900011122",
    birth_date: "1991-10-31",
    origin: "TOTALPASS",
    plan: "MENSAL_BASE",
    status: false,
    avatar_url: null,
  },
  {
    full_name: "Larissa Oliveira",
    email: "larissa.oliveira@email.com",
    cpf: "10020030040",
    birth_date: "1997-05-06",
    origin: "GYMPASS",
    plan: "ANUAL_PRO",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Thiago Mendes",
    email: "thiago.mendes@email.com",
    cpf: "11022033044",
    birth_date: "1989-01-19",
    origin: "ACADEMIA",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Patrícia Gomes",
    email: "patricia.gomes@email.com",
    cpf: "12033044055",
    birth_date: "1995-07-07",
    origin: "TOTALPASS",
    plan: "TRIMESTRAL_PREMIUM",
    status: true,
    avatar_url: null,
  },
  {
    full_name: "Bruno Carvalho",
    email: "bruno.carvalho@email.com",
    cpf: "13044055066",
    birth_date: "2000-03-22",
    origin: "GYMPASS",
    plan: "MENSAL_BASE",
    status: true,
    avatar_url: null,
  },
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

const { data, error } = await supabase
  .from("members")
  .upsert(MEMBERS_SEED, { onConflict: "email", ignoreDuplicates: true })
  .select("id");

if (error) {
  if (error.message.includes("Could not find the table")) {
    console.error(
      "Tabela members não existe. Execute supabase/members.sql no Supabase primeiro.",
    );
  } else {
    console.error("Erro ao inserir seed:", error.message);
  }
  process.exit(1);
}

const { count, error: countError } = await supabase
  .from("members")
  .select("*", { count: "exact", head: true });

if (countError) {
  console.error("Seed inserido, mas falhou ao contar registros:", countError.message);
  process.exit(1);
}

const inserted = data?.length ?? 0;
const skipped = MEMBERS_SEED.length - inserted;

console.log(`✓ Seed concluído.`);
console.log(`  Inseridos agora: ${inserted}`);
console.log(`  Já existiam (ignorados): ${skipped}`);
console.log(`  Total na tabela: ${count ?? 0}`);
