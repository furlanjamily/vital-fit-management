"use server";

import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/resolve-user-display";
import { createClient } from "@/lib/supabase/server";
import type { ManagedUser, UserRole, UserStatus } from "@/components/users/users.types";

const USER_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "TRAINER", "MEMBER"];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type CreateUserResult =
  | { ok: true; user: ManagedUser }
  | { ok: true; simulated: true }
  | { ok: false; error: string };

type UpdateUserInput = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

export type UpdateUserResult =
  | { ok: true; user: ManagedUser; isCurrentUser: boolean }
  | { ok: true; simulated: true }
  | { ok: false; error: string };

export type ListUsersResult =
  | { ok: true; users: ManagedUser[] }
  | { ok: false; error: string };

function parseRole(metadata: Record<string, unknown>): UserRole {
  const raw = metadata.role;
  if (typeof raw === "string") {
    const upper = raw.toUpperCase() as UserRole;
    if (USER_ROLES.includes(upper)) return upper;
  }
  return "MEMBER";
}

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

  return {
    id: user.id,
    name: resolveDisplayName(metadata, user.email ?? undefined),
    email: user.email ?? "",
    role: parseRole(metadata),
    status: parseStatus(user),
    avatarUrl: resolveAvatarUrl(metadata),
  };
}

async function requireSuperAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Sessão expirada. Faça login novamente." };
  }

  const metadataRole = user.user_metadata?.role;
  const role =
    typeof metadataRole === "string"
      ? (metadataRole.toUpperCase() as UserRole)
      : "SUPER_ADMIN";

  if (role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Acesso negado." };
  }

  return { ok: true as const, currentUser: user };
}

export async function listUsersAction(): Promise<ListUsersResult> {
  const session = await requireSuperAdminSession();
  if (!session.ok) return session;

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error: "Configure SUPABASE_SERVICE_ROLE_KEY no .env para listar usuários.",
    };
  }

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 100 });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    users: (data.users ?? []).map(mapAuthUserToManaged),
  };
}

export async function updateUserAction(input: UpdateUserInput): Promise<UpdateUserResult> {
  const session = await requireSuperAdminSession();
  if (!session.ok) return session;

  if (!UUID_REGEX.test(input.id)) {
    return {
      ok: false,
      error: "ID de usuário inválido. Recarregue a página para sincronizar a lista.",
    };
  }

  const admin = createAdminClient();

  if (!admin) {
    return { ok: true, simulated: true };
  }

  const payload: {
    email: string;
    user_metadata: { name: string; role: UserRole };
    password?: string;
  } = {
    email: input.email,
    user_metadata: {
      name: input.name,
      role: input.role,
    },
  };

  if (input.password?.trim()) {
    payload.password = input.password.trim();
  }

  const { data, error } = await admin.auth.admin.updateUserById(input.id, payload);

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "Não foi possível atualizar o usuário.",
    };
  }

  return {
    ok: true,
    isCurrentUser: data.user.id === session.currentUser.id,
    user: mapAuthUserToManaged(data.user),
  };
}

export async function createUserAction(input: CreateUserInput): Promise<CreateUserResult> {
  const session = await requireSuperAdminSession();
  if (!session.ok) return session;

  const admin = createAdminClient();

  if (!admin) {
    return { ok: true, simulated: true };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name,
      role: input.role,
    },
  });

  if (error || !data.user) {
    return {
      ok: false,
      error: error?.message ?? "Não foi possível criar o usuário.",
    };
  }

  return {
    ok: true,
    user: mapAuthUserToManaged(data.user),
  };
}
