import type { Metadata } from "next";
import { listUsersAction } from "@/app/(app)/users/actions";
import { AccessDenied } from "@/components/users/AccessDenied";
import { UsersContent } from "@/components/users/UsersContent";
import { resolveUserRole } from "@/lib/auth/resolve-user-role";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Usuários | VitalFit Management",
  description: "Gestão e cadastro de usuários do VitalFit Management.",
};

/**
 * Simulação de RBAC: lê a role de user_metadata.role quando existir.
 * Enquanto os perfis não são persistidos no Supabase, usuários logados
 * sem role definida são tratados como SUPER_ADMIN para desenvolvimento.
 */
async function resolveCurrentRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return resolveUserRole(user.user_metadata);
}

export default async function UsersPage() {
  const role = await resolveCurrentRole();

  if (role !== "SUPER_ADMIN") {
    return <AccessDenied />;
  }

  const result = await listUsersAction();

  return (
    <UsersContent
      initialUsers={result.success ? result.data : []}
      loadError={result.success ? null : result.error}
    />
  );
}
