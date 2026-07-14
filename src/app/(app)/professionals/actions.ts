"use server";

import { revalidatePath } from "next/cache";
import {
  professionalFormSchema,
  type ValidatedProfessionalForm,
} from "@/components/professionals/professional.schema";
import {
  formatBirthDateFromIso,
  formatCref,
} from "@/components/professionals/professional.helpers";
import type {
  ManagedProfessional,
  ProfessionalFormValues,
  ProfessionalRow,
  ProfessionalRowWithMemberCount,
  ScheduleProfessionalOption,
} from "@/components/professionals/professionals.types";
import type { ProfessionalSpecialty } from "@/config/professional-specialties";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { isUuid } from "@/lib/is-uuid";
import { createClient } from "@/lib/supabase/server";

const PROFESSIONALS_PATH = "/professionals";
const MEMBERS_PATH = "/members";
const PROFESSIONALS_TABLE = "professionals";

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const INVALID_PROFESSIONAL_ID_MESSAGE = "ID de profissional inválido.";
const MISSING_PROFESSIONALS_TABLE_MESSAGE =
  "Tabela professionals não existe. Abra o SQL Editor do Supabase e execute o arquivo supabase/professionals.sql.";

const PROFESSIONALS_SELECT_WITH_MEMBER_COUNT =
  "*, members(count)" as const;

function extractMemberCount(row: ProfessionalRowWithMemberCount): number {
  return row.members?.[0]?.count ?? 0;
}

function mapRowToManaged(
  row: ProfessionalRow,
  memberCount = 0,
): ManagedProfessional {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    cref: formatCref(row.cref),
    birthDate: formatBirthDateFromIso(row.birth_date),
    gender: row.gender,
    shift: row.shift,
    specialty: row.specialty,
    status: row.status ? "active" : "inactive",
    avatarUrl: row.avatar_url,
    memberCount,
  };
}

function toProfessionalRowPayload(values: ValidatedProfessionalForm) {
  return {
    full_name: values.name,
    email: values.email,
    cref: values.cref,
    birth_date: values.birthDate,
    gender: values.gender,
    shift: values.shift,
    specialty: values.specialty,
    status: values.status === "active",
    avatar_url: values.avatarUrl,
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
  if (message.includes("professionals_email_unique")) {
    return "Este e-mail já está cadastrado.";
  }

  if (message.includes("professionals_cref_unique")) {
    return "CREF já cadastrado.";
  }

  const isMissingTable =
    message.includes('relation "public.professionals" does not exist') ||
    message.includes("Could not find the table 'public.professionals'") ||
    message.includes("schema cache");

  if (isMissingTable) return MISSING_PROFESSIONALS_TABLE_MESSAGE;

  if (message.includes("specialty") && message.includes("does not exist")) {
    return "Coluna specialty não existe. Execute supabase/schedule-professionals-integration.sql no Supabase.";
  }

  return message;
}

export async function getProfessionalsAction(): Promise<
  ActionResult<ManagedProfessional[]>
> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .select(PROFESSIONALS_SELECT_WITH_MEMBER_COUNT)
      .order("created_at", { ascending: false });

    if (error) return actionFailure(mapDatabaseError(error.message));

    const rows = (data ?? []) as ProfessionalRowWithMemberCount[];

    return actionSuccess(
      rows.map((row) => mapRowToManaged(row, extractMemberCount(row))),
    );
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar profissionais."));
  }
}

export async function createProfessionalAction(
  formValues: ProfessionalFormValues,
): Promise<ActionResult<ManagedProfessional>> {
  try {
    const parsed = professionalFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: row, error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .insert(toProfessionalRowPayload(parsed.data))
      .select("*")
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível cadastrar o profissional."),
      );
    }

    revalidatePath(PROFESSIONALS_PATH);

    return actionSuccess(mapRowToManaged(row as ProfessionalRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao cadastrar profissional."));
  }
}

export async function updateProfessionalAction(
  id: string,
  formValues: ProfessionalFormValues,
): Promise<ActionResult<ManagedProfessional>> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_PROFESSIONAL_ID_MESSAGE);

    const parsed = professionalFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: row, error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .update(toProfessionalRowPayload(parsed.data))
      .eq("id", id)
      .select("*")
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível atualizar o profissional."),
      );
    }

    revalidatePath(PROFESSIONALS_PATH);
    revalidatePath(MEMBERS_PATH);

    return actionSuccess(mapRowToManaged(row as ProfessionalRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar profissional."));
  }
}

export async function updateProfessionalStatusAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult<ManagedProfessional>> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_PROFESSIONAL_ID_MESSAGE);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: row, error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .update({ status: isActive })
      .eq("id", id)
      .select(PROFESSIONALS_SELECT_WITH_MEMBER_COUNT)
      .single();

    if (error || !row) {
      return actionFailure(error?.message ?? "Não foi possível alterar o status.");
    }

    revalidatePath(PROFESSIONALS_PATH);

    const typedRow = row as ProfessionalRowWithMemberCount;

    return actionSuccess(
      mapRowToManaged(typedRow, extractMemberCount(typedRow)),
    );
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao alterar status."));
  }
}

export async function getScheduleProfessionalsAction(): Promise<
  ActionResult<ScheduleProfessionalOption[]>
> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .select("id, full_name, specialty, status")
      .order("full_name", { ascending: true });

    if (error) return actionFailure(mapDatabaseError(error.message));

    const rows = data ?? [];

    return actionSuccess(
      rows.map((row) => ({
        id: row.id as string,
        name: row.full_name as string,
        specialty: (row.specialty ?? "Crossfit") as ProfessionalSpecialty,
        status: (row.status ? "active" : "inactive") as "active" | "inactive",
      })),
    );
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar profissionais para a grade."));
  }
}

export async function deleteProfessionalAction(id: string): Promise<ActionResult> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_PROFESSIONAL_ID_MESSAGE);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { error } = await session.supabase
      .from(PROFESSIONALS_TABLE)
      .delete()
      .eq("id", id);

    if (error) return actionFailure(error.message);

    revalidatePath(PROFESSIONALS_PATH);
    revalidatePath(MEMBERS_PATH);

    return actionSuccess(null);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao remover profissional."));
  }
}
