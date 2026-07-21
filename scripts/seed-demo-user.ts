/**
 * VitalFit Management — cria/atualiza o usuário demo "Teste" no Supabase Auth
 *
 * Variáveis no .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Execução:
 *   npm run seed:demo
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { DEMO_USER } from "../src/config/demo-auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DEMO_USER_ID = "c1111111-1111-4111-8111-1111111111d1";

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

async function main() {
  const { url, serviceRoleKey } = loadEnv();

  if (!url || !serviceRoleKey) {
    fail("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });

  if (listError) fail(`Erro ao listar usuários: ${listError.message}`);

  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === DEMO_USER.email.toLowerCase(),
  );

  const metadata = {
    name: DEMO_USER.displayName,
    full_name: DEMO_USER.displayName,
    role: DEMO_USER.role,
    seed: "demo",
  };

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: DEMO_USER.password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) fail(`Erro ao atualizar ${DEMO_USER.email}: ${error.message}`);

    console.log(`✓ Usuário demo atualizado: ${DEMO_USER.email} (${existing.id})`);
    console.log(`  Nome: ${DEMO_USER.displayName}`);
    console.log(`  Senha: ${DEMO_USER.password}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    id: DEMO_USER_ID,
    email: DEMO_USER.email,
    password: DEMO_USER.password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error || !data.user) {
    fail(`Erro ao criar ${DEMO_USER.email}: ${error?.message ?? "usuário vazio"}`);
  }

  console.log(`✓ Usuário demo criado: ${DEMO_USER.email} (${data.user.id})`);
  console.log(`  Nome: ${DEMO_USER.displayName}`);
  console.log(`  Senha: ${DEMO_USER.password}`);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
