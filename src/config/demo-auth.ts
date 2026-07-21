/**
 * Modo demonstração temporário para publicação pública.
 * Desative `DEMO_AUTH_ENABLED` quando o login real voltar.
 *
 * Credenciais do usuário real no Supabase Auth (criado via `npm run seed:demo`).
 */
export const DEMO_AUTH_ENABLED = true;

export const DEMO_USER = {
  displayName: "Teste",
  email: "teste@vitalfit.com",
  /** Senha mockada do usuário demo — atende o schema de login. */
  password: "Teste@2026",
  role: "SUPER_ADMIN" as const,
  avatarUrl: null as string | null,
} as const;

/** Botão Sair fica desabilitado enquanto o demo estiver ativo. */
export const DEMO_LOGOUT_DISABLED = true;
