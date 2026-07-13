export const FINANCIAL_CATEGORY_TYPES = ["RECEITA", "DESPESA"] as const;

export type FinancialCategoryType = (typeof FINANCIAL_CATEGORY_TYPES)[number];

export type FinancialCategory = {
  id: string;
  name: string;
  type: FinancialCategoryType;
  color: string;
  is_system: boolean;
  created_at?: string;
};

export type FinancialCategoryFormValues = {
  name: string;
  type: FinancialCategoryType;
  color: string;
};

export const DEFAULT_CATEGORY_COLOR = "#FF7A00";

export const financialCategoryTypeLabels: Record<FinancialCategoryType, string> = {
  RECEITA: "Receita",
  DESPESA: "Despesa",
};

export const financialCategoryTypeOptions = FINANCIAL_CATEGORY_TYPES.map((value) => ({
  value,
  label: financialCategoryTypeLabels[value],
}));
