"use server";

import type { User } from "@supabase/supabase-js";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/components/users/user.schema";
import {
  isUserRole,
  type ManagedUser,
  type UserStatus,
} from "@/components/users/users.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import {
  resolveUserAvatarForMetadata,
} from "@/lib/avatars/resolve-user-avatar";
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/resolve-user-display";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const LIST_USERS_PER_PAGE = 100;

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const ACCESS_DENIED_MESSAGE = "Acesso negado.";
const MISSING_SERVICE_ROLE_MESSAGE =
  "Configure SUPABASE_SERVICE_ROLE_KEY no .env para listar usuários.";

/**
 * Sem a service role configurada, as mutações não persistem: a action devolve
 * `persisted: false` e o client informa o modo simulação ao usuário.
 */
export type CreateUserData =
  | { persisted: true; user: ManagedUser }
  | { persisted: false };

export type UpdateUserData =
  | { persisted: true; user: ManagedUser; isCurrentUser: boolean }
  | { persisted: false };

function parseStatus(user: User): UserStatus {
  if (typeof user.user_metadata?.status === "string") {
    return user.user_metadata.status === "inactive" ? "inactive" : "active";
  }

  if (user.banned_until && new Date(user.banned_until) > new Date()) {
    return "inactive";
  }

  return "active";
}

function mapAuthUserToManaged(user: User): ManagedUser {
  const metadata = user.user_metadata ?? {};
  const rawRole = typeof metadata.role === "string" ? metadata.role.toUpperCase() : null;

  return {
    id: user.id,
    name: resolveDisplayName(metadata, user.email ?? undefined),
    email: user.email ?? "",
    role: isUserRole(rawRole) ? rawRole : "MEMBER",
    status: parseStatus(user),
    avatarUrl: resolveAvatarUrl(metadata),
  };
}

type SuperAdminSession =
  | { authorized: true; currentUser: User }
  | { authorized: false; error: string };

async function requireSuperAdminSession(): Promise<SuperAdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, error: SESSION_EXPIRED_MESSAGE };

  // Usuário sem role definida é tratado como SUPER_ADMIN apenas em desenvolvimento,
  // enquanto os perfis não são persistidos no Supabase.
  const metadataRole = user.user_metadata?.role;
  const role =
    typeof metadataRole === "string" ? metadataRole.toUpperCase() : "SUPER_ADMIN";

  if (role !== "SUPER_ADMIN") {
    return { authorized: false, error: ACCESS_DENIED_MESSAGE };
  }

  return { authorized: true, currentUser: user };
}

export async function listUsersAction(): Promise<ActionResult<ManagedUser[]>> {
  try {
    const session = await requireSuperAdminSession();
    if (!session.authorized) return actionFailure(session.error);

    const admin = createAdminClient();
    if (!admin) return actionFailure(MISSING_SERVICE_ROLE_MESSAGE);

    const { data, error } = await admin.auth.admin.listUsers({
      perPage: LIST_USERS_PER_PAGE,
    });

    if (error) return actionFailure(error.message);

    return actionSuccess((data.users ?? []).map(mapAuthUserToManaged));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao listar usuários."));
  }
}

export async function createUserAction(
  input: CreateUserInput,
): Promise<ActionResult<CreateUserData>> {
  try {
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireSuperAdminSession();
    if (!session.authorized) return actionFailure(session.error);

    const admin = createAdminClient();
    if (!admin) return actionSuccess<CreateUserData>({ persisted: false });

    const { name, email, password, role, avatarUrl } = parsed.data;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        avatar_url: null,
      },
    });

    if (error || !data.user) {
      return actionFailure(error?.message ?? "Não foi possível criar o usuário.");
    }

    let createdUser = data.user;

    if (avatarUrl) {
      const resolved = await resolveUserAvatarForMetadata(admin, createdUser.id, avatarUrl);
      if (!resolved.ok) return actionFailure(resolved.error);

      const { data: updated, error: avatarError } = await admin.auth.admin.updateUserById(
        createdUser.id,
        { user_metadata: { name, role, avatar_url: resolved.url } },
      );

      if (avatarError || !updated.user) {
        return actionFailure(
          avatarError?.message ?? "Usuário criado, mas a foto não pôde ser salva.",
        );
      }

      createdUser = updated.user;
    }

    return actionSuccess<CreateUserData>({
      persisted: true,
      user: mapAuthUserToManaged(createdUser),
    });
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao criar usuário."));
  }
}

export async function updateUserAction(
  input: UpdateUserInput,
): Promise<ActionResult<UpdateUserData>> {
  try {
    const parsed = updateUserSchema.safeParse(input);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireSuperAdminSession();
    if (!session.authorized) return actionFailure(session.error);

    const admin = createAdminClient();
    if (!admin) return actionSuccess<UpdateUserData>({ persisted: false });

    const { id, name, email, role, password, avatarUrl } = parsed.data;

    const resolved = await resolveUserAvatarForMetadata(admin, id, avatarUrl ?? null);
    if (!resolved.ok) return actionFailure(resolved.error);

    const { data, error } = await admin.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        name,
        role,
        avatar_url: resolved.url,
      },
      ...(password ? { password } : {}),
    });

    if (error || !data.user) {
      return actionFailure(error?.message ?? "Não foi possível atualizar o usuário.");
    }

    return actionSuccess<UpdateUserData>({
      persisted: true,
      user: mapAuthUserToManaged(data.user),
      isCurrentUser: data.user.id === session.currentUser.id,
    });
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar usuário."));
  }
}
