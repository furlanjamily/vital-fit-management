"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getFinancialCategoryByIdAction } from "@/app/(app)/settings/categories/actions";
import { mapFinancialTransactionRow } from "@/components/finance/financial-transactions/financial-transaction.helpers";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import {
  groupExpensesByCategory,
  groupMovementsByDate,
  mergeExpenseCategoriesWithTotals,
  resolveFinanceFilterDates,
} from "@/components/finance/finance.helpers";
import {
  transactionFormSchema,
  toValidatedTransactionForm,
} from "@/components/finance/transaction.schema";
import type {
  CategoryExpense,
  DailyMovement,
  FinanceFilter,
  FinancePeriod,
  FinanceSummary,
  FinancialBalance,
} from "@/components/finance/finance.types";
import type {
  CreatedTransaction,
  TransactionFormValues,
} from "@/components/finance/transaction.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/is-uuid";

const FINANCE_PATH = "/finance";
const TRANSACTIONS_TABLE = "financial_transactions";
const CATEGORIES_TABLE = "financial_categories";

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const INVALID_TRANSACTION_ID_MESSAGE = "ID de transação inválido.";
const MEMBERSHIP_TRANSACTION_MESSAGE =
  "Mensalidades de alunos não podem ser editadas ou excluídas por aqui.";
const MISSING_FINANCE_TABLE_MESSAGE =
  "Tabelas financeiras não existem. Execute supabase/plans.sql, supabase/financial-transactions.sql e supabase/financial-reports.sql no Supabase.";

type BalanceRow = {
  receitas: number | string;
  despesas: number | string;
  saldo: number | string;
};

type TransactionRow = {
  category_id?: string;
  amount: number | string;
  type: string;
  transaction_date: string;
  financial_categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

type AuthenticatedSession =
  | { authenticated: true; supabase: Awaited<ReturnType<typeof createClient>> }
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
  const isMissingTable =
    message.includes('relation "public.financial_transactions" does not exist') ||
    message.includes("Could not find the table 'public.financial_transactions'") ||
    message.includes("Could not find the function public.financial_balance") ||
    message.includes("schema cache");

  if (isMissingTable) return MISSING_FINANCE_TABLE_MESSAGE;

  return message;
}

function normalizeBalance(row: BalanceRow | null | undefined): FinancialBalance {
  return {
    receitas: Number(row?.receitas ?? 0),
    despesas: Number(row?.despesas ?? 0),
    saldo: Number(row?.saldo ?? 0),
  };
}

async function fetchBalanceRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rpcName: "financial_balance_today" | "financial_balance_month" | "financial_balance_year",
): Promise<ActionResult<FinancialBalance>> {
  const { data, error } = await supabase.rpc(rpcName);

  if (error) return actionFailure(mapDatabaseError(error.message));

  const row = Array.isArray(data) ? (data[0] as BalanceRow | undefined) : (data as BalanceRow | null);

  return actionSuccess(normalizeBalance(row));
}

function periodNeedsComputedBalance(period?: FinancePeriod): boolean {
  return period === "thisWeek";
}

async function fetchBalanceForRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  start: string,
  end: string,
): Promise<ActionResult<FinancialBalance>> {
  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .select("amount, type")
    .gte("transaction_date", start)
    .lte("transaction_date", end);

  if (error) return actionFailure(mapDatabaseError(error.message));

  let receitas = 0;
  let despesas = 0;

  for (const row of data ?? []) {
    if (row.type === "RECEITA") receitas += Number(row.amount);
    if (row.type === "DESPESA") despesas += Number(row.amount);
  }

  return actionSuccess({ receitas, despesas, saldo: receitas - despesas });
}

async function fetchBalanceAllTime(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<ActionResult<FinancialBalance>> {
  const { data, error } = await supabase.from(TRANSACTIONS_TABLE).select("amount, type");

  if (error) return actionFailure(mapDatabaseError(error.message));

  let receitas = 0;
  let despesas = 0;

  for (const row of data ?? []) {
    if (row.type === "RECEITA") receitas += Number(row.amount);
    if (row.type === "DESPESA") despesas += Number(row.amount);
  }

  return actionSuccess({ receitas, despesas, saldo: receitas - despesas });
}

export async function getFinanceSummaryAction(): Promise<ActionResult<FinanceSummary>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const [todayResult, monthResult, yearResult, totalResult] = await Promise.all([
      fetchBalanceRpc(session.supabase, "financial_balance_today"),
      fetchBalanceRpc(session.supabase, "financial_balance_month"),
      fetchBalanceRpc(session.supabase, "financial_balance_year"),
      fetchBalanceAllTime(session.supabase),
    ]);

    const firstError = [todayResult, monthResult, yearResult, totalResult].find(
      (result) => !result.success,
    );

    if (firstError && !firstError.success) {
      return actionFailure(firstError.error);
    }

    return actionSuccess({
      today: todayResult.success ? todayResult.data : { receitas: 0, despesas: 0, saldo: 0 },
      month: monthResult.success ? monthResult.data : { receitas: 0, despesas: 0, saldo: 0 },
      year: yearResult.success ? yearResult.data : { receitas: 0, despesas: 0, saldo: 0 },
      total: totalResult.success ? totalResult.data : { receitas: 0, despesas: 0, saldo: 0 },
    });
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar resumo financeiro."));
  }
}

export async function getFinanceMovementsAction(
  filter: FinanceFilter = { kind: "period", period: "thisMonth" },
): Promise<ActionResult<DailyMovement[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { start, end } = resolveFinanceFilterDates(filter);

    const { data, error } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .select("transaction_date, amount, type")
      .gte("transaction_date", start)
      .lte("transaction_date", end)
      .order("transaction_date", { ascending: true });

    if (error) return actionFailure(mapDatabaseError(error.message));

    return actionSuccess(
      groupMovementsByDate((data ?? []) as TransactionRow[]),
    );
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar movimentações."));
  }
}

export async function getFinanceExpensesByCategoryAction(
  filter: FinanceFilter = { kind: "period", period: "thisMonth" },
): Promise<ActionResult<CategoryExpense[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { start, end } = resolveFinanceFilterDates(filter);

    const [categoriesResult, transactionsResult] = await Promise.all([
      session.supabase
        .from(CATEGORIES_TABLE)
        .select("id, name, color")
        .eq("type", "DESPESA")
        .order("name", { ascending: true }),
      session.supabase
        .from(TRANSACTIONS_TABLE)
        .select("category_id, amount, financial_categories!inner(id, name, color)")
        .eq("type", "DESPESA")
        .gte("transaction_date", start)
        .lte("transaction_date", end),
    ]);

    if (categoriesResult.error) {
      return actionFailure(mapDatabaseError(categoriesResult.error.message));
    }
    if (transactionsResult.error) {
      return actionFailure(mapDatabaseError(transactionsResult.error.message));
    }

    const transactionTotals = groupExpensesByCategory(
      (transactionsResult.data ?? []) as {
        category_id?: string;
        amount: number | string;
        financial_categories?:
          | { id: string; name: string; color: string }
          | { id: string; name: string; color: string }[]
          | null;
      }[],
    );

    return actionSuccess(
      mergeExpenseCategoriesWithTotals(categoriesResult.data ?? [], transactionTotals),
    );
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar despesas por categoria."));
  }
}

export async function getFinancialTransactionsAction(
  filter: FinanceFilter = { kind: "period", period: "thisMonth" },
): Promise<ActionResult<FinancialTransaction[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { start, end } = resolveFinanceFilterDates(filter);

    const { data, error } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .select(
        "id, description, amount, type, payment_method, transaction_date, member_id, category_id, financial_categories!inner(id, name, color), members(full_name)",
      )
      .gte("transaction_date", start)
      .lte("transaction_date", end)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) return actionFailure(mapDatabaseError(error.message));

    const transactions = (data ?? [])
      .map((row) => mapFinancialTransactionRow(row as Parameters<typeof mapFinancialTransactionRow>[0]))
      .filter((row): row is FinancialTransaction => row !== null);

    return actionSuccess(transactions);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar transações."));
  }
}

export async function getFinanceDashboardAction(
  filter: FinanceFilter = { kind: "period", period: "thisMonth" },
) {
  const { start, end, period } = resolveFinanceFilterDates(filter);
  const needsComputedBalance = filter.kind === "range" || periodNeedsComputedBalance(period);

  const session = await requireAuthenticatedClient();
  const balancePromise =
    needsComputedBalance && session.authenticated
      ? fetchBalanceForRange(session.supabase, start, end)
      : Promise.resolve(null);

  const [summaryResult, movementsResult, expensesResult, transactionsResult, balanceResult] =
    await Promise.all([
    getFinanceSummaryAction(),
    getFinanceMovementsAction(filter),
    getFinanceExpensesByCategoryAction(filter),
    getFinancialTransactionsAction(filter),
    balancePromise,
  ]);

  return {
    summary: summaryResult,
    movements: movementsResult,
    expenses: expensesResult,
    transactions: transactionsResult,
    balance: balanceResult,
  };
}

function toTransactionPayload(values: ReturnType<typeof toValidatedTransactionForm>) {
  return {
    description: values.description,
    amount: values.amount,
    type: values.type,
    category_id: values.category_id,
    payment_method: values.payment_method,
    member_id: values.member_id,
    transaction_date: new Date().toISOString().slice(0, 10),
  };
}

export async function createTransactionAction(
  formValues: TransactionFormValues,
): Promise<ActionResult<CreatedTransaction>> {
  try {
    const parsed = transactionFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    let validated;
    try {
      validated = toValidatedTransactionForm(parsed.data);
    } catch {
      return actionFailure("Dados da transação inválidos.");
    }

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const categoryResult = await getFinancialCategoryByIdAction(
      validated.category_id,
      validated.type,
    );
    if (!categoryResult.success) return actionFailure(categoryResult.error);

    const { data: row, error } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .insert(toTransactionPayload(validated))
      .select(
        "id, description, amount, type, category_id, payment_method, transaction_date, member_id",
      )
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível registrar a transação."),
      );
    }

    revalidatePath(FINANCE_PATH);

    return actionSuccess({
      id: row.id,
      description: row.description,
      amount: Number(row.amount),
      type: row.type,
      category_id: row.category_id,
      payment_method: row.payment_method,
      transaction_date: row.transaction_date,
      member_id: row.member_id,
    } as CreatedTransaction);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao registrar transação."));
  }
}

export async function updateTransactionAction(
  id: string,
  formValues: TransactionFormValues,
): Promise<ActionResult<CreatedTransaction>> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_TRANSACTION_ID_MESSAGE);

    const parsed = transactionFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    let validated;
    try {
      validated = toValidatedTransactionForm(parsed.data);
    } catch {
      return actionFailure("Dados da transação inválidos.");
    }

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: existing, error: fetchError } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .select("member_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
    if (!existing) return actionFailure("Transação não encontrada.");
    if (existing.member_id) return actionFailure(MEMBERSHIP_TRANSACTION_MESSAGE);

    const categoryResult = await getFinancialCategoryByIdAction(
      validated.category_id,
      validated.type,
    );
    if (!categoryResult.success) return actionFailure(categoryResult.error);

    const { data: row, error } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .update({
        description: validated.description,
        amount: validated.amount,
        type: validated.type,
        category_id: validated.category_id,
        payment_method: validated.payment_method,
      })
      .eq("id", id)
      .select(
        "id, description, amount, type, category_id, payment_method, transaction_date, member_id",
      )
      .single();

    if (error || !row) {
      return actionFailure(
        mapDatabaseError(error?.message ?? "Não foi possível atualizar a transação."),
      );
    }

    revalidatePath(FINANCE_PATH);

    return actionSuccess({
      id: row.id,
      description: row.description,
      amount: Number(row.amount),
      type: row.type,
      category_id: row.category_id,
      payment_method: row.payment_method,
      transaction_date: row.transaction_date,
      member_id: row.member_id,
    } as CreatedTransaction);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar transação."));
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult<null>> {
  try {
    if (!isUuid(id)) return actionFailure(INVALID_TRANSACTION_ID_MESSAGE);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: existing, error: fetchError } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .select("member_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
    if (!existing) return actionFailure("Transação não encontrada.");
    if (existing.member_id) return actionFailure(MEMBERSHIP_TRANSACTION_MESSAGE);

    const { error } = await session.supabase.from(TRANSACTIONS_TABLE).delete().eq("id", id);

    if (error) return actionFailure(mapDatabaseError(error.message));

    revalidatePath(FINANCE_PATH);
    return actionSuccess(null);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao excluir transação."));
  }
}
