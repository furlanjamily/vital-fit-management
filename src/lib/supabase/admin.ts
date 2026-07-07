import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service role para operações administrativas (criar/listar usuários).
 * Só funciona no servidor. Retorna null se SUPABASE_SERVICE_ROLE_KEY não estiver
 * configurada — os callers devem degradar para o modo simulação.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
