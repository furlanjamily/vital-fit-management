import { isUserRole, type UserRole } from "@/components/users/users.types";

type UserMetadata = Record<string, unknown> | undefined;

/**
 * Lê a role de user_metadata.role.
 * Sem role definida: SUPER_ADMIN (fallback de desenvolvimento — alinhado a /users/page.tsx).
 */
export function resolveUserRole(metadata: UserMetadata): UserRole | null {
  const metadataRole = metadata?.role;
  if (typeof metadataRole !== "string") return "SUPER_ADMIN";

  const normalizedRole = metadataRole.toUpperCase();
  return isUserRole(normalizedRole) ? normalizedRole : null;
}

export function isSuperAdminRole(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}
