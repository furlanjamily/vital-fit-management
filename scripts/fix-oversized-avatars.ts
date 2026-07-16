/**
 * Remove avatars base64 de user_metadata (corrige HTTP 431 / cookie JWT enorme).
 *
 * Execução:
 *   npx tsx scripts/fix-oversized-avatars.ts
 *
 * Depois limpe os cookies de http://localhost:3000 e faça login de novo.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { stripDataUrlAvatarFromMetadata } from "../src/lib/avatars/resolve-user-avatar";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

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
    // .env opcional
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? vars.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? vars.SUPABASE_SERVICE_ROLE_KEY,
  };
}

async function main() {
  const { url, serviceRoleKey } = loadEnv();

  if (!url || !serviceRoleKey) {
    console.error("✗ Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
    process.exit(1);
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n→ Limpando avatar_url base64 em user_metadata…\n");

  let page = 1;
  let fixed = 0;
  let scanned = 0;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      console.error(`✗ ${error.message}`);
      process.exit(1);
    }

    const users = data.users ?? [];
    if (users.length === 0) break;

    for (const user of users) {
      scanned += 1;
      const metadata = user.user_metadata ?? {};
      const hasDataUrl = ["avatar_url", "avatarUrl", "picture", "photo"].some((key) => {
        const value = metadata[key];
        return typeof value === "string" && value.startsWith("data:");
      });

      if (!hasDataUrl) continue;

      const cleaned = stripDataUrlAvatarFromMetadata(metadata);
      // Garante limpeza explícita das chaves (merge do GoTrue preserva null? melhor delete + set null)
      cleaned.avatar_url = null;

      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: cleaned,
      });

      if (updateError) {
        console.error(`  ✗ ${user.email ?? user.id}: ${updateError.message}`);
        continue;
      }

      fixed += 1;
      console.log(`  ✓ ${user.email ?? user.id}`);
    }

    if (users.length < 100) break;
    page += 1;
  }

  console.log(`\n✓ Escaneados: ${scanned} | Corrigidos: ${fixed}`);
  console.log("\nPróximo passo:");
  console.log("  1. No Chrome: DevTools → Application → Cookies → localhost → Clear");
  console.log("  2. Acesse http://localhost:3000 e faça login de novo\n");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
