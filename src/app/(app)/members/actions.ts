"use server";

import { revalidatePath } from "next/cache";
import {
  ENROLLMENT_ORIGINS,
  MEMBER_PLANS,
  type EnrollmentOrigin,
  type ManagedMember,
  type MemberFormData,
  type MemberPlan,
  type MemberRow,
} from "@/components/members/members.types";
import {
  formatBirthDateFromIso,
  formatCpf,
  isValidCpf,
  isValidEmail,
  parseBirthDateToIso,
  stripCpf,
} from "@/components/members/member.helpers";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type GetMembersResult =
  | { ok: true; members: ManagedMember[] }
  | { ok: false; error: string };

export type CreateMemberResult =
  | { ok: true; member: ManagedMember }
  | { ok: false; error: string };

export type UpdateMemberResult =
  | { ok: true; member: ManagedMember }
  | { ok: false; error: string };

export type UpdateMemberStatusResult =
  | { ok: true; member: ManagedMember }
  | { ok: false; error: string };

export type DeleteMemberResult = { ok: true } | { ok: false; error: string };

function mapRowToManaged(row: MemberRow): ManagedMember {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    cpf: formatCpf(row.cpf),
    birthDate: formatBirthDateFromIso(row.birth_date),
    origin: row.origin,
    plan: row.plan ?? "MENSAL_BASE",
    status: row.status ? "active" : "inactive",
    avatarUrl: row.avatar_url,
  };
}

function parseOrigin(value: string): EnrollmentOrigin | null {
  const upper = value.toUpperCase() as EnrollmentOrigin;
  return ENROLLMENT_ORIGINS.includes(upper) ? upper : null;
}

function parsePlan(value: string): MemberPlan | null {
  const upper = value.toUpperCase() as MemberPlan;
  return MEMBER_PLANS.includes(upper) ? upper : null;
}

function validateMemberFormData(data: MemberFormData): string | null {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const cpf = stripCpf(data.cpf);
  const birthDateIso = parseBirthDateToIso(data.birthDate);

  if (!name) return "Informe o nome completo.";
  if (!isValidEmail(email)) return "Informe um e-mail válido.";
  if (!isValidCpf(cpf)) return "Informe um CPF válido (11 dígitos).";
  if (!birthDateIso) return "Informe uma data de nascimento válida (DD/MM/AAAA).";
  if (!parseOrigin(data.origin)) return "Origem inválida.";
  if (!parsePlan(data.plan)) return "Plano inválido.";

  return null;
}

function formDataToInsertPayload(data: MemberFormData) {
  return {
    full_name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    cpf: stripCpf(data.cpf),
    birth_date: parseBirthDateToIso(data.birthDate)!,
    origin: data.origin,
    plan: data.plan,
    status: data.status === "active",
    avatar_url: data.avatarUrl?.trim() || null,
  };
}

async function requireAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      error: "Sessão expirada. Faça login novamente.",
    };
  }

  return { ok: true as const, supabase };
}

function mapDatabaseError(message: string): string {
  if (message.includes("members_email_unique")) {
    return "Este e-mail já está cadastrado.";
  }

  if (message.includes("members_cpf_unique")) {
    return "Este CPF já está cadastrado.";
  }

  if (
    message.includes('relation "public.members" does not exist') ||
    message.includes("Could not find the table 'public.members'") ||
    message.includes("schema cache")
  ) {
    return "Tabela members não existe. Abra o SQL Editor do Supabase e execute o arquivo supabase/members.sql.";
  }

  return message;
}

export async function getMembersAction(): Promise<GetMembersResult> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.ok) return session;

    const { data, error } = await session.supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, error: mapDatabaseError(error.message) };
    }

    return {
      ok: true,
      members: (data as MemberRow[]).map(mapRowToManaged),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao buscar alunos.",
    };
  }
}

export async function createMemberAction(
  data: MemberFormData,
): Promise<CreateMemberResult> {
  try {
    const validationError = validateMemberFormData(data);
    if (validationError) return { ok: false, error: validationError };

    const session = await requireAuthenticatedClient();
    if (!session.ok) return session;

    const { data: row, error } = await session.supabase
      .from("members")
      .insert(formDataToInsertPayload(data))
      .select("*")
      .single();

    if (error || !row) {
      return {
        ok: false,
        error: mapDatabaseError(error?.message ?? "Não foi possível cadastrar o aluno."),
      };
    }

    revalidatePath("/members");

    return { ok: true, member: mapRowToManaged(row as MemberRow) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao cadastrar aluno.",
    };
  }
}

export async function updateMemberAction(
  id: string,
  data: MemberFormData,
): Promise<UpdateMemberResult> {
  try {
    if (!UUID_REGEX.test(id)) {
      return { ok: false, error: "ID de aluno inválido." };
    }

    const validationError = validateMemberFormData(data);
    if (validationError) return { ok: false, error: validationError };

    const session = await requireAuthenticatedClient();
    if (!session.ok) return session;

    const { data: row, error } = await session.supabase
      .from("members")
      .update(formDataToInsertPayload(data))
      .eq("id", id)
      .select("*")
      .single();

    if (error || !row) {
      return {
        ok: false,
        error: mapDatabaseError(error?.message ?? "Não foi possível atualizar o aluno."),
      };
    }

    revalidatePath("/members");

    return { ok: true, member: mapRowToManaged(row as MemberRow) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar aluno.",
    };
  }
}

export async function updateMemberStatusAction(
  id: string,
  isActive: boolean,
): Promise<UpdateMemberStatusResult> {
  try {
    if (!UUID_REGEX.test(id)) {
      return { ok: false, error: "ID de aluno inválido." };
    }

    const session = await requireAuthenticatedClient();
    if (!session.ok) return session;

    const { data: row, error } = await session.supabase
      .from("members")
      .update({ status: isActive })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !row) {
      return {
        ok: false,
        error: error?.message ?? "Não foi possível alterar o status.",
      };
    }

    revalidatePath("/members");

    return { ok: true, member: mapRowToManaged(row as MemberRow) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao alterar status.",
    };
  }
}

export async function deleteMemberAction(id: string): Promise<DeleteMemberResult> {
  try {
    if (!UUID_REGEX.test(id)) {
      return { ok: false, error: "ID de aluno inválido." };
    }

    const session = await requireAuthenticatedClient();
    if (!session.ok) return session;

    const { error } = await session.supabase.from("members").delete().eq("id", id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/members");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro ao remover aluno.",
    };
  }
}
