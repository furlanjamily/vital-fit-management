import type { Metadata } from "next";
import { AccessDenied } from "@/components/users/AccessDenied";
import { UsersContent } from "@/components/users/UsersContent";
import type { UserRole } from "@/components/users/users.types";
import { listUsersAction } from "@/app/(app)/users/actions";
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
  if (typeof metadataRole === "string") {
    return metadataRole.toUpperCase() as UserRole;
  }

  return "SUPER_ADMIN";
}

export default async function UsersPage() {
  const role = await resolveCurrentRole();

  if (role !== "SUPER_ADMIN") {
    return <AccessDenied />;
  }

  const usersResult = await listUsersAction();

  return (
    <UsersContent
      initialUsers={usersResult.ok ? usersResult.users : []}
      loadError={usersResult.ok ? null : usersResult.error}
    />
  );
}
