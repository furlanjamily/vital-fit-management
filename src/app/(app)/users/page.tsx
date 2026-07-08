import type { Metadata } from "next";
import { listUsersAction } from "@/app/(app)/users/actions";
import { AccessDenied } from "@/components/users/AccessDenied";
import { UsersContent } from "@/components/users/UsersContent";
import { isUserRole, type UserRole } from "@/components/users/users.types";
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
async function resolveCurrentRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const metadataRole = user.user_metadata?.role;
  if (typeof metadataRole !== "string") return "SUPER_ADMIN";

  const normalizedRole = metadataRole.toUpperCase();
  return isUserRole(normalizedRole) ? normalizedRole : null;
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
