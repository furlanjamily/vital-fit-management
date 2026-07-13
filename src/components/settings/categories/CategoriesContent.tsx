import { getFinancialCategoriesAction } from "@/app/(app)/settings/categories/actions";
import { CategoriesContentClient } from "@/components/settings/categories/CategoriesContentClient";
import type { FinancialCategory } from "@/components/finance/finance-category.types";

function categoriesCacheKey(categories: FinancialCategory[]) {
  return categories
    .map((category) => `${category.id}:${category.name}:${category.type}:${category.color}`)
    .join("|");
}

export async function CategoriesContent() {
  const result = await getFinancialCategoriesAction();
  const categories = result.success ? result.data : [];

  return (
    <CategoriesContentClient
      key={categoriesCacheKey(categories)}
      initialCategories={categories}
      loadError={result.success ? null : result.error}
    />
  );
}
