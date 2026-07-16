import type { SupabaseClient } from "@supabase/supabase-js";

const AVATARS_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 512_000;

type ParsedDataUrl = {
  mimeType: string;
  extension: string;
  buffer: Buffer;
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function parseDataUrl(dataUrl: string): ParsedDataUrl | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const mimeType = match[1]!.toLowerCase();
  const extension = MIME_TO_EXT[mimeType];
  if (!extension) return null;

  const buffer = Buffer.from(match[2]!, "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_AVATAR_BYTES) return null;

  return { mimeType, extension, buffer };
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

async function ensureAvatarsBucket(admin: SupabaseClient): Promise<string | null> {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) return listError.message;

  const exists = (buckets ?? []).some((bucket) => bucket.id === AVATARS_BUCKET);
  if (exists) return null;

  const { error: createError } = await admin.storage.createBucket(AVATARS_BUCKET, {
    public: true,
    fileSizeLimit: MAX_AVATAR_BYTES,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    return (
      createError.message ||
      "Não foi possível criar o bucket avatars. Execute supabase/avatars-storage.sql."
    );
  }

  return null;
}

/**
 * Converte data URL → Storage e devolve URL pública.
 * URLs http(s) são reutilizadas. null limpa o avatar.
 * Nunca retorna data: — isso quebraria o cookie JWT (HTTP 431).
 */
export async function resolveUserAvatarForMetadata(
  admin: SupabaseClient,
  userId: string,
  avatarUrl: string | null,
): Promise<{ ok: true; url: string | null } | { ok: false; error: string }> {
  if (!avatarUrl) return { ok: true, url: null };

  if (isHttpUrl(avatarUrl)) return { ok: true, url: avatarUrl };

  if (!avatarUrl.startsWith("data:image/")) {
    return { ok: false, error: "Formato de imagem inválido." };
  }

  const parsed = parseDataUrl(avatarUrl);
  if (!parsed) {
    return {
      ok: false,
      error: "Imagem inválida ou grande demais (máx. 500 KB após compressão).",
    };
  }

  const bucketError = await ensureAvatarsBucket(admin);
  if (bucketError) return { ok: false, error: bucketError };

  const path = `users/${userId}.${parsed.extension}`;
  const { error: uploadError } = await admin.storage.from(AVATARS_BUCKET).upload(path, parsed.buffer, {
    contentType: parsed.mimeType,
    upsert: true,
    cacheControl: "3600",
  });

  if (uploadError) {
    return {
      ok: false,
      error:
        uploadError.message ||
        "Falha no upload do avatar. Execute supabase/avatars-storage.sql no Supabase.",
    };
  }

  const { data } = admin.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;

  if (!publicUrl) return { ok: false, error: "Não foi possível obter a URL pública do avatar." };

  return { ok: true, url: publicUrl };
}

/** Remove avatar_url base64 do metadata (recupera sessões com cookie estourado). */
export function stripDataUrlAvatarFromMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const next = { ...(metadata ?? {}) };
  const keys = ["avatar_url", "avatarUrl", "picture", "photo"] as const;

  for (const key of keys) {
    const value = next[key];
    if (typeof value === "string" && value.startsWith("data:")) {
      delete next[key];
    }
  }

  return next;
}
