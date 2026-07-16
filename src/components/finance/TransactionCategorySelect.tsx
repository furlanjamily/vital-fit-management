"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { getFinancialCategoriesAction } from "@/app/(app)/settings/categories/actions";
import { FormField, GlassSelect } from "@/components/common/form";
import type { FinancialCategory } from "@/components/finance/finance-category.types";
import type { TransactionType } from "@/components/finance/transaction.types";

type TransactionCategorySelectProps = {
  type: TransactionType | "";
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  invalid?: boolean;
};

export function TransactionCategorySelect({
  type,
  value,
  onChange,
  error,
  invalid,
}: TransactionCategorySelectProps) {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!type) {
      setCategories([]);
      setLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function loadCategories(selectedType: TransactionType) {
      setLoading(true);
      setLoadError(null);
      setCategories([]);

      const result = await getFinancialCategoriesAction(selectedType);

      if (cancelled) return;

      if (!result.success) {
        setCategories([]);
        setLoadError(result.error);
        setLoading(false);
        return;
      }

      setCategories(result.data);
      setLoading(false);
    }

    void loadCategories(type);

    return () => {
      cancelled = true;
    };
  }, [type]);

  const options = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const placeholder = !type
    ? "Selecione o tipo primeiro"
    : loading
      ? "Carregando…"
      : options.length === 0
        ? "Nenhuma categoria"
        : "Selecione a categoria";

  return (
    <FormField
      label="Categoria"
      htmlFor="category_id"
      error={error ?? loadError ?? undefined}
    >
      <GlassSelect
        id="category_id"
        key={type || "empty"}
        leftIcon={Tag}
        options={options}
        placeholder={placeholder}
        disabled={!type || loading || options.length === 0}
        invalid={invalid || Boolean(loadError)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
