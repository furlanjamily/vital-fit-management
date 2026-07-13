"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  DEFAULT_CATEGORY_COLOR,
  FINANCIAL_CATEGORY_TYPES,
  type FinancialCategory,
  type FinancialCategoryFormValues,
  type FinancialCategoryType,
} from "@/components/finance/finance-category.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES_TABLE = "financial_categories";
const TRANSACTIONS_TABLE = "financial_transactions";
const CATEGORIES_PATH = "/settings/categories";
const FINANCE_PATH = "/finance";

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const MISSING_CATEGORIES_TABLE_MESSAGE =
  "Tabela financial_categories não existe. Execute supabase/financial-categories.sql no Supabase.";

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria.").max(80, "Nome muito longo."),
  type: z.enum(FINANCIAL_CATEGORY_TYPES, "Tipo inválido."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Informe uma cor válida no formato #RRGGBB."),
});

type CategoryRow = {
  id: string;
  name: string;
  type: FinancialCategoryType;
  color: string;
  is_system: boolean;
  created_at: string;
};

async function requireAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false as const, error: SESSION_EXPIRED_MESSAGE };

  return { authenticated: true as const, supabase };
}

function mapDatabaseError(message: string): string {
  if (
    message.includes('relation "public.financial_categories" does not exist') ||
    message.includes("Could not find the table 'public.financial_categories'") ||
    message.includes("schema cache")
  ) {
    return MISSING_CATEGORIES_TABLE_MESSAGE;
  }

  if (message.includes("financial_categories_name_type_unique")) {
    return "Já existe uma categoria com este nome para o tipo selecionado.";
  }

  if (message.includes("violates foreign key constraint")) {
    return "Não é possível remover uma categoria vinculada a transações.";
  }

  return message;
}

function mapCategoryRow(row: CategoryRow): FinancialCategory {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    is_system: row.is_system,
    created_at: row.created_at,
  };
}

function revalidateCategoryPaths() {
  revalidatePath(CATEGORIES_PATH);
  revalidatePath(FINANCE_PATH);
  revalidatePath("/settings");
}

export async function getFinancialCategoriesAction(
  type?: FinancialCategoryType,
): Promise<ActionResult<FinancialCategory[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    let query = session.supabase
      .from(CATEGORIES_TABLE)
      .select("id, name, type, color, is_system, created_at")
      .order("name", { ascending: true });

    if (type) query = query.eq("type", type);

    const { data, error } = await query;

    if (error) return actionFailure(mapDatabaseError(error.message));

    return actionSuccess((data ?? []).map((row) => mapCategoryRow(row as CategoryRow)));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar categorias."));
  }
}

export async function getFinancialCategoryByIdAction(
  categoryId: string,
  expectedType?: FinancialCategoryType,
): Promise<ActionResult<FinancialCategory>> {
  try {
    const parsedId = z.string().uuid().safeParse(categoryId);
    if (!parsedId.success) return actionFailure("Categoria inválida.");

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    let query = session.supabase
      .from(CATEGORIES_TABLE)
      .select("id, name, type, color, is_system, created_at")
      .eq("id", categoryId);

    if (expectedType) query = query.eq("type", expectedType);

    const { data, error } = await query.maybeSingle();

    if (error) return actionFailure(mapDatabaseError(error.message));
    if (!data) return actionFailure("Categoria não encontrada.");

    return actionSuccess(mapCategoryRow(data as CategoryRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao validar categoria."));
  }
}

export async function createFinancialCategoryAction(
  formValues: FinancialCategoryFormValues,
): Promise<ActionResult<FinancialCategory>> {
  try {
    const parsed = categoryFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(CATEGORIES_TABLE)
      .insert({
        name: parsed.data.name,
        type: parsed.data.type,
        color: parsed.data.color || DEFAULT_CATEGORY_COLOR,
      })
      .select("id, name, type, color, is_system, created_at")
      .single();

    if (error || !data) {
      return actionFailure(mapDatabaseError(error?.message ?? "Não foi possível criar a categoria."));
    }

    revalidateCategoryPaths();
    return actionSuccess(mapCategoryRow(data as CategoryRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao criar categoria."));
  }
}

export async function updateFinancialCategoryAction(
  id: string,
  formValues: FinancialCategoryFormValues,
): Promise<ActionResult<FinancialCategory>> {
  try {
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) return actionFailure("Categoria inválida.");

    const parsed = categoryFormSchema.safeParse(formValues);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: existing, error: fetchError } = await session.supabase
      .from(CATEGORIES_TABLE)
      .select("is_system, type")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
    if (!existing) return actionFailure("Categoria não encontrada.");
    if (existing.is_system && existing.type !== parsed.data.type) {
      return actionFailure("O tipo de categorias do sistema não pode ser alterado.");
    }

    const { data, error } = await session.supabase
      .from(CATEGORIES_TABLE)
      .update({
        name: parsed.data.name,
        type: parsed.data.type,
        color: parsed.data.color,
      })
      .eq("id", id)
      .select("id, name, type, color, is_system, created_at")
      .single();

    if (error || !data) {
      return actionFailure(mapDatabaseError(error?.message ?? "Não foi possível atualizar a categoria."));
    }

    revalidateCategoryPaths();
    return actionSuccess(mapCategoryRow(data as CategoryRow));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao atualizar categoria."));
  }
}

export async function deleteFinancialCategoryAction(id: string): Promise<ActionResult<null>> {
  try {
    const parsedId = z.string().uuid().safeParse(id);
    if (!parsedId.success) return actionFailure("Categoria inválida.");

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data: existing, error: fetchError } = await session.supabase
      .from(CATEGORIES_TABLE)
      .select("is_system")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return actionFailure(mapDatabaseError(fetchError.message));
    if (!existing) return actionFailure("Categoria não encontrada.");
    if (existing.is_system) {
      return actionFailure("Categorias do sistema não podem ser removidas.");
    }

    const { count, error: countError } = await session.supabase
      .from(TRANSACTIONS_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) return actionFailure(mapDatabaseError(countError.message));
    if ((count ?? 0) > 0) {
      return actionFailure("Esta categoria possui transações vinculadas e não pode ser removida.");
    }

    const { error } = await session.supabase.from(CATEGORIES_TABLE).delete().eq("id", id);

    if (error) return actionFailure(mapDatabaseError(error.message));

    revalidateCategoryPaths();
    return actionSuccess(null);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao remover categoria."));
  }
}

export async function getMensalidadeCategoryIdAction(): Promise<ActionResult<string>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { data, error } = await session.supabase
      .from(CATEGORIES_TABLE)
      .select("id")
      .eq("type", "RECEITA")
      .eq("is_system", true)
      .eq("name", "Mensalidade")
      .maybeSingle();

    if (error) return actionFailure(mapDatabaseError(error.message));
    if (!data?.id) {
      return actionFailure("Categoria de mensalidade não configurada. Execute financial-categories.sql.");
    }

    return actionSuccess(data.id);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao buscar categoria de mensalidade."));
  }
}
