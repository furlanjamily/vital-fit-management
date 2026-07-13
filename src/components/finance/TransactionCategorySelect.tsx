"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { getFinancialCategoriesAction } from "@/app/(app)/settings/categories/actions";
import { FormField, GlassSelect } from "@/components/common/form";
import type { FinancialCategory } from "@/components/finance/finance-category.types";
import type { TransactionType } from "@/components/finance/transaction.types";

type TransactionCategorySelectProps = {
  type: TransactionType;
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      setLoadError(null);

      const result = await getFinancialCategoriesAction(type);

      if (cancelled) return;

      if (!result.success) {
        setCategories([]);
        setLoadError(result.error);
        setLoading(false);
        return;
      }

      setCategories(result.data);
      setLoading(false);

      const hasCurrent = result.data.some((category) => category.id === value);
      if (!hasCurrent && result.data[0]) {
        onChange(result.data[0].id);
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [type]);

  const options = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <FormField
      label="Categoria"
      htmlFor="category_id"
      error={error ?? loadError ?? undefined}
    >
      <GlassSelect
        id="category_id"
        key={type}
        leftIcon={Tag}
        options={options}
        placeholder={loading ? "Carregando…" : "Selecione a categoria"}
        disabled={loading || options.length === 0}
        invalid={invalid || Boolean(loadError)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
