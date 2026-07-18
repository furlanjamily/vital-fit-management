import { resolveSessionRoleLabel } from "@/components/dashboard/right-sidebar/right-sidebar.helpers";
import {
  PROFILE_SPECIALTIES,
  type ProfileSession,
  type ProfileSpecialty,
} from "@/components/profile/profile.types";
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/resolve-user-display";
import type { User } from "@supabase/supabase-js";

/** Máscara telefone BR: (00) 00000-0000 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function stripPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function isProfileSpecialty(value: unknown): value is ProfileSpecialty {
  return (
    typeof value === "string" &&
    (PROFILE_SPECIALTIES as readonly string[]).includes(value)
  );
}

export function resolveJobTitle(metadata: Record<string, unknown>): string {
  if (isProfileSpecialty(metadata.specialty)) return metadata.specialty;

  if (typeof metadata.specialty === "string" && metadata.specialty.trim()) {
    return metadata.specialty.trim();
  }

  if (typeof metadata.job_title === "string" && metadata.job_title.trim()) {
    return metadata.job_title.trim();
  }

  return resolveSessionRoleLabel(metadata.role);
}

export function mapUserToProfileSession(user: User): ProfileSession {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const phoneRaw =
    (typeof metadata.phone === "string" && metadata.phone) ||
    (typeof metadata.whatsapp === "string" && metadata.whatsapp) ||
    "";

  return {
    displayName: resolveDisplayName(metadata, user.email ?? undefined),
    email: user.email ?? "",
    phone: formatPhone(phoneRaw),
    specialty: isProfileSpecialty(metadata.specialty) ? metadata.specialty : "",
    roleLabel: resolveJobTitle(metadata),
    avatarUrl: resolveAvatarUrl(metadata),
  };
}
