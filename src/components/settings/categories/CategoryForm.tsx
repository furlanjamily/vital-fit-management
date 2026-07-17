"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, Palette, Tag } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  FormField,
  GlassButton,
  GlassInput,
  GlassSelect,
} from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import {
  DEFAULT_CATEGORY_COLOR,
  financialCategoryTypeOptions,
  type FinancialCategory,
  type FinancialCategoryFormValues,
} from "@/components/finance/finance-category.types";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const EMPTY_VALUES: FinancialCategoryFormValues = {
  name: "",
  type: "DESPESA",
  color: DEFAULT_CATEGORY_COLOR,
};

function buildInitialValues(category: FinancialCategory | null): FinancialCategoryFormValues {
  if (!category) return EMPTY_VALUES;

  return {
    name: category.name,
    type: category.type,
    color: category.color,
  };
}

type CategoryFormProps = {
  editingCategory: FinancialCategory | null;
  onSuccess: (category: FinancialCategory) => void;
  onCancel: () => void;
  createAction: typeof import("@/app/(app)/settings/categories/actions").createFinancialCategoryAction;
  updateAction: typeof import("@/app/(app)/settings/categories/actions").updateFinancialCategoryAction;
};

export function CategoryForm({
  editingCategory,
  onSuccess,
  onCancel,
  createAction,
  updateAction,
}: CategoryFormProps) {
  const [values, setValues] = useState<FinancialCategoryFormValues>(() =>
    buildInitialValues(editingCategory),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(editingCategory);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateAction(editingCategory!.id, values)
        : await createAction(values);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      onSuccess(result.data);
    });
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onCancel}
      title={isEditing ? "Editar categoria" : "Nova categoria"}
      description="Categorias aparecem automaticamente no financeiro e nos formulários"
      size="md"
    >
      {errorMessage ? <InlineAlert className="mb-4 text-xs">{errorMessage}</InlineAlert> : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField label="Nome" htmlFor="name">
          <GlassInput
            id="name"
            leftIcon={Tag}
            placeholder="Ex.: Marketing, Mensalidade extra…"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </FormField>

        <FormField label="Tipo" htmlFor="type">
          <GlassSelect
            id="type"
            options={financialCategoryTypeOptions}
            value={values.type}
            disabled={editingCategory?.is_system}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                type: event.target.value as FinancialCategoryFormValues["type"],
              }))
            }
          />
        </FormField>

        <FormField label="Cor" htmlFor="color">
          <div className="flex items-center gap-3">
            <div className="relative">
              <GlassInput
                id="color"
                leftIcon={Palette}
                value={values.color}
                onChange={(event) =>
                  setValues((current) => ({ ...current, color: event.target.value.toUpperCase() }))
                }
                placeholder="#FF7A00"
                className="font-mono uppercase"
                required
              />
            </div>
            <input
              type="color"
              aria-label="Selecionar cor"
              value={values.color}
              onChange={(event) =>
                setValues((current) => ({ ...current, color: event.target.value.toUpperCase() }))
              }
              className="size-10 shrink-0 cursor-pointer rounded-lg border border-white/15 bg-transparent p-1"
            />
            <span
              className="size-8 shrink-0 rounded-full border border-white/20"
              style={{ backgroundColor: values.color }}
              aria-hidden="true"
            />
          </div>
        </FormField>

        {editingCategory?.is_system ? (
          <p className={cn("text-xs", glassText.muted)}>
            Categoria do sistema — o tipo não pode ser alterado.
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <GlassButton variant="subtle" size="sm" type="button" onClick={onCancel} disabled={isPending}>
            Cancelar
          </GlassButton>

          <GlassButton
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-gradient-to-r from-orange-500 to-orange-600"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Salvando…
              </>
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Criar categoria"
            )}
          </GlassButton>
        </div>
      </form>
    </ResponsiveModal>
  );
}
