"use server";

import {
  mapUserToProfileSession,
} from "@/components/profile/profile.helpers";
import {
  profileGeneralSchema,
  type ProfileGeneralSchemaInput,
} from "@/components/profile/profile.schema";
import type { ProfileSession } from "@/components/profile/profile.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import {
  resolveUserAvatarForMetadata,
  stripDataUrlAvatarFromMetadata,
} from "@/lib/avatars/resolve-user-avatar";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const MISSING_SERVICE_ROLE_MESSAGE =
  "Configure SUPABASE_SERVICE_ROLE_KEY no .env para salvar a foto de perfil.";

export async function updateOwnProfileAction(
  input: ProfileGeneralSchemaInput,
): Promise<ActionResult<ProfileSession>> {
  try {
    const parsed = profileGeneralSchema.safeParse(input);
    if (!parsed.success) {
      return actionFailure(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return actionFailure(SESSION_EXPIRED_MESSAGE);

    const admin = createAdminClient();
    if (!admin) return actionFailure(MISSING_SERVICE_ROLE_MESSAGE);

    const { fullName, phone, specialty, avatarUrl } = parsed.data;
    const resolved = await resolveUserAvatarForMetadata(admin, user.id, avatarUrl);
    if (!resolved.ok) return actionFailure(resolved.error);

    const existingMetadata = stripDataUrlAvatarFromMetadata(user.user_metadata);
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMetadata,
        name: fullName,
        phone: phone.trim(),
        specialty,
        avatar_url: resolved.url,
      },
    });

    if (error || !data.user) {
      return actionFailure(error?.message ?? "Não foi possível salvar as alterações.");
    }

    return actionSuccess(mapUserToProfileSession(data.user));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar o perfil."));
  }
}
