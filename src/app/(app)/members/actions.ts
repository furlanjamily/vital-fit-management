"use server";

import { revalidatePath } from "next/cache";
import {
  memberFormSchema,
  type ValidatedMemberForm,
} from "@/components/members/member.schema";
import {
  formatBirthDateFromIso,
  formatCpf,
  getPaymentStatus,
  isMembershipPaymentCurrent,
} from "@/components/members/member.helpers";
import type {
  ManagedMember,
  MemberFormValues,
  MemberPlan,
  MemberRow,
  ProfessionalOption,
} from "@/components/members/members.types";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/components/members/payment.types";
import { getMensalidadeCategoryIdAction } from "@/app/(app)/settings/categories/actions";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { isUuid } from "@/lib/is-uuid";
import { createClient } from "@/lib/supabase/server";
import { resolvePlanPrice } from "@/config/plan-prices";

const MEMBERS_PATH = "/members";
const FINANCE_PATH = "/finance";
const MEMBERS_TABLE = "members";
const PROFESSIONALS_TABLE = "professionals";
const PLANS_TABLE = "plans";
const TRANSACTIONS_TABLE = "financial_transactions";

const MEMBERS_SELECT_WITH_PROFESSIONAL = "*, professionals(id, full_name)" as const;

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const INVALID_MEMBER_ID_MESSAGE = "ID de aluno inválido.";
const MISSING_MEMBERS_TABLE_MESSAGE =
  "Tabela members não existe. Abra o SQL Editor do Supabase e execute o arquivo supabase/members.sql.";

type MemberRowWithProfessional = MemberRow & {
  professionals: { id: string; full_name: string } | null;
};

type PlanPricesMap = Partial<Record<MemberPlan, number>>;

function mapRowToManaged(
  row: MemberRowWithProfessional,
  planPrices: PlanPricesMap = {},
): ManagedMember {
  const plan = row.plan ?? "MENSAL_BASE";

  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    cpf: formatCpf(row.cpf),
    birthDate: formatBirthDateFromIso(row.birth_date),
    origin: row.origin,
    plan,
    status: row.status ? "active" : "inactive",
    avatarUrl: row.avatar_url,
    professionalId: row.professional_id,
    professionalName: row.professionals?.full_name ?? null,
    paymentStatus: row.payment_status ?? false,
    lastPaymentDate: row.last_payment_date?.slice(0, 10) ?? null,
    nextDueDate: row.next_due_date?.slice(0, 10) ?? null,
    planPrice: resolvePlanPrice(plan, planPrices[plan]),
  };
}

async function fetchPlanPricesMap(
  supabase: ServerSupabaseClient,
): Promise<PlanPricesMap> {
  const { data, error } = await supabase.from(PLANS_TABLE).select("name, price");

  if (error || !data) return {};

  return Object.fromEntries(
    data.map((plan) => [plan.name as MemberPlan, Number(plan.price)]),
  ) as PlanPricesMap;
}

async function mapRowWithPlanPrices(
  supabase: ServerSupabaseClient,
  row: MemberRowWithProfessional,
  planPrices?: PlanPricesMap,
): Promise<ManagedMember> {
  const prices = planPrices ?? (await fetchPlanPricesMap(supabase));
  return mapRowToManaged(row, prices);
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

    const planPrices = await fetchPlanPricesMap(session.supabase);

    return actionSuccess(
      (data as MemberRowWithProfessional[]).map((row) => mapRowToManaged(row, planPrices)),
    );
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

    return actionSuccess(await mapRowWithPlanPrices(session.supabase, row as MemberRowWithProfessional));
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

    return actionSuccess(await mapRowWithPlanPrices(session.supabase, row as MemberRowWithProfessional));
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

    return actionSuccess(await mapRowWithPlanPrices(session.supabase, row as MemberRowWithProfessional));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao alterar status."));
  }
}

export type MemberPaymentPreview = {
  id: string;
  name: string;
  plan: MemberPlan;
  planPrice: number;
  paymentStatus: boolean;
  nextDueDate: string | null;
  displayStatus: ReturnType<typeof getPaymentStatus>;
  canConfirmPayment: boolean;
};

async function fetchPlanPriceForMember(
  supabase: ServerSupabaseClient,
  plan: MemberPlan,
): Promise<number> {
  const { data, error } = await supabase
    .from(PLANS_TABLE)
    .select("price")
    .eq("name", plan)
    .maybeSingle();

  if (error || !data) return resolvePlanPrice(plan);

  return resolvePlanPrice(plan, Number(data.price));
}

export async function getMemberPaymentPreviewAction(
  memberId: string,
): Promise<ActionResult<MemberPaymentPreview>> {
  try {
    if (!isUuid(memberId)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: member, error } = await session.supabase
      .from(MEMBERS_TABLE)
      .select("id, full_name, plan, payment_status, next_due_date")
      .eq("id", memberId)
      .maybeSingle();

    if (error) return actionFailure(mapDatabaseError(error.message));
    if (!member) return actionFailure("Aluno não encontrado.");

    const plan = (member.plan ?? "MENSAL_BASE") as MemberPlan;
    const planPrice = await fetchPlanPriceForMember(session.supabase, plan);
    const nextDueDate = member.next_due_date?.slice(0, 10) ?? null;
    const paymentStatus = member.payment_status ?? false;
    const displayStatus = getPaymentStatus(nextDueDate, paymentStatus);

    return actionSuccess({
      id: member.id,
      name: member.full_name,
      plan,
      planPrice,
      paymentStatus,
      nextDueDate,
      displayStatus,
      canConfirmPayment: !isMembershipPaymentCurrent(nextDueDate, paymentStatus),
    });
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao carregar dados do pagamento."));
  }
}

export async function confirmMemberPaymentAction(
  memberId: string,
  paymentMethod: PaymentMethod,
): Promise<ActionResult<ManagedMember>> {
  try {
    if (!isUuid(memberId)) return actionFailure(INVALID_MEMBER_ID_MESSAGE);

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return actionFailure("Forma de pagamento inválida.");
    }

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: member, error: fetchError } = await session.supabase
      .from(MEMBERS_TABLE)
      .select("id, plan, payment_status, next_due_date, full_name")
      .eq("id", memberId)
      .maybeSingle();

    if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
    if (!member) return actionFailure("Aluno não encontrado.");

    const nextDueDate = member.next_due_date?.slice(0, 10) ?? null;
    const paymentStatus = member.payment_status ?? false;

    if (isMembershipPaymentCurrent(nextDueDate, paymentStatus)) {
      return actionFailure("Este aluno está em dia com a mensalidade.");
    }

    if (!member.plan) {
      return actionFailure("Aluno sem plano definido. Não é possível registrar pagamento.");
    }

    const { data: plan, error: planError } = await session.supabase
      .from(PLANS_TABLE)
      .select("name, price")
      .eq("name", member.plan)
      .maybeSingle();

    if (planError) return actionFailure(mapDatabaseError(planError.message));
    if (!plan) {
      return actionFailure(`Plano "${member.plan}" não encontrado na tabela plans.`);
    }

    const transactionDate = new Date().toISOString().slice(0, 10);

    const mensalidadeCategory = await getMensalidadeCategoryIdAction();
    if (!mensalidadeCategory.success) {
      return actionFailure(mensalidadeCategory.error);
    }

    const { error: transactionError } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .insert({
        member_id: memberId,
        description: `Mensalidade — ${member.full_name}`,
        amount: plan.price,
        type: "RECEITA",
        category_id: mensalidadeCategory.data,
        payment_method: paymentMethod,
        transaction_date: transactionDate,
      });

    if (transactionError) {
      return actionFailure(mapDatabaseError(transactionError.message));
    }

    const { data: row, error } = await session.supabase
      .from(MEMBERS_TABLE)
      .select(MEMBERS_SELECT_WITH_PROFESSIONAL)
      .eq("id", memberId)
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível confirmar o pagamento."),
      );
    }

    revalidatePath(MEMBERS_PATH);
    revalidatePath(FINANCE_PATH);

    const planPrices: PlanPricesMap = {
      [member.plan as MemberPlan]: Number(plan.price),
    };

    return actionSuccess(mapRowToManaged(row as MemberRowWithProfessional, planPrices));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao confirmar pagamento."));
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
