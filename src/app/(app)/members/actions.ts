"use server";

import { revalidatePath } from "next/cache";
import {
  memberFormSchema,
  type ValidatedMemberForm,
} from "@/components/members/member.schema";
import {
  formatBirthDateFromIso,
  formatCpf,
} from "@/components/members/member.helpers";
import type {
  ManagedMember,
  MemberFormValues,
  MemberRow,
  ProfessionalOption,
} from "@/components/members/members.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { isUuid } from "@/lib/is-uuid";
import { createClient } from "@/lib/supabase/server";

const MEMBERS_PATH = "/members";
const MEMBERS_TABLE = "members";
const PROFESSIONALS_TABLE = "professionals";

const MEMBERS_SELECT_WITH_PROFESSIONAL = "*, professionals(id, full_name)" as const;

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const INVALID_MEMBER_ID_MESSAGE = "ID de aluno inválido.";
const MISSING_MEMBERS_TABLE_MESSAGE =
  "Tabela members não existe. Abra o SQL Editor do Supabase e execute o arquivo supabase/members.sql.";

type MemberRowWithProfessional = MemberRow & {
  professionals: { id: string; full_name: string } | null;
};

function mapRowToManaged(row: MemberRowWithProfessional): ManagedMember {
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
    professionalId: row.professional_id,
    professionalName: row.professionals?.full_name ?? null,
  };
}

function toMemberRowPayload(values: ValidatedMemberForm) {
  return {
    full_name: values.name,
    email: values.email,
    cpf: values.cpf,
    birth_date: values.birthDate,
    origin: values.origin,
    plan: values.plan,
    status: values.status === "active",
    avatar_url: values.avatarUrl,
    professional_id: values.professionalId,
  };
}

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type AuthenticatedSession =
  | { authenticated: true; supabase: ServerSupabaseClient }
  | { authenticated: false; error: string };

async function requireAuthenticatedClient(): Promise<AuthenticatedSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false, error: SESSION_EXPIRED_MESSAGE };

  return { authenticated: true, supabase };
}

function mapDatabaseError(message: string): string {
  if (message.includes("members_email_unique")) {
    return "Este e-mail já está cadastrado.";
  }

  if (message.includes("members_cpf_unique")) {
    return "Este CPF já está cadastrado.";
  }

  const isMissingTable =
    message.includes('relation "public.members" does not exist') ||
    message.includes("Could not find the table 'public.members'") ||
    message.includes("schema cache");

  if (isMissingTable) return MISSING_MEMBERS_TABLE_MESSAGE;

  return message;
}

export async function getMembersAction(): Promise<ActionResult<ManagedMember[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(MEMBERS_TABLE)
      .select(MEMBERS_SELECT_WITH_PROFESSIONAL)
      .order("created_at", { ascending: false });

    if (error) return actionFailure(mapDatabaseError(error.message));

    return actionSuccess((data as MemberRowWithProfessional[]).map(mapRowToManaged));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar alunos."));
  }
}

export async function getActiveProfessionalsOptionsAction(): Promise<
  ActionResult<ProfessionalOption[]>
> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .select("id, full_name")
      .eq("status", true)
      .order("full_name", { ascending: true });

    if (error) return actionFailure(error.message);

    return actionSuccess(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.full_name,
      })),
    );
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar profissionais."));
  }
}

export async function createMemberAction(
  formValues: MemberFormValues,
): Promise<ActionResult<ManagedMember>> {
  try {
    const parsed = memberFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: row, error } = await session.supabase
      .from(MEMBERS_TABLE)
      .insert(toMemberRowPayload(parsed.data))
      .select(MEMBERS_SELECT_WITH_PROFESSIONAL)
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível cadastrar o aluno."),
      );
    }

    revalidatePath(MEMBERS_PATH);

    return actionSuccess(mapRowToManaged(row as MemberRowWithProfessional));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao cadastrar aluno."));
  }
}

export async function updateMemberAction(
  id: string,
  formValues: MemberFormValues,
): Promise<ActionResult<ManagedMember>> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);

    const parsed = memberFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: row, error } = await session.supabase
      .from(MEMBERS_TABLE)
      .update(toMemberRowPayload(parsed.data))
      .eq("id", id)
      .select(MEMBERS_SELECT_WITH_PROFESSIONAL)
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível atualizar o aluno."),
      );
    }

    revalidatePath(MEMBERS_PATH);

    return actionSuccess(mapRowToManaged(row as MemberRowWithProfessional));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar aluno."));
  }
}

export async function updateMemberStatusAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult<ManagedMember>> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: row, error } = await session.supabase
      .from(MEMBERS_TABLE)
      .update({ status: isActive })
      .eq("id", id)
      .select(MEMBERS_SELECT_WITH_PROFESSIONAL)
      .single();

    if (error || !row) {
      return actionFailure(error?.message ?? "Não foi possível alterar o status.");
    }

    revalidatePath(MEMBERS_PATH);

    return actionSuccess(mapRowToManaged(row as MemberRowWithProfessional));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao alterar status."));
  }
}

export async function deleteMemberAction(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { error } = await session.supabase
      .from(MEMBERS_TABLE)
      .delete()
      .eq("id", id);

    if (error) return actionFailure(error.message);

    revalidatePath(MEMBERS_PATH);

    return actionSuccess(null);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao remover aluno."));
  }
}
