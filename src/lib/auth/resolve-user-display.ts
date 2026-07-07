type UserMetadata = Record<string, unknown>;

export function resolveDisplayName(metadata: UserMetadata, email?: string): string {
  const rawName =
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.display_name === "string" && metadata.display_name) ||
    "";

  const trimmed = rawName.trim();
  if (trimmed) return trimmed;

  const emailPrefix = email?.split("@")[0];
  if (emailPrefix) {
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }

  return "Usuário";
}

/** Primeiro nome para saudações (ex: "Welcome Jakob!"). */
export function resolveFirstName(metadata: UserMetadata, email?: string): string {
  const displayName = resolveDisplayName(metadata, email);
  const firstName = displayName.trim().split(/\s+/)[0];
  return firstName || "Usuário";
}

export function resolveAvatarUrl(metadata: UserMetadata): string | null {
  const candidates = [metadata.avatar_url, metadata.picture, metadata.photo];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}
