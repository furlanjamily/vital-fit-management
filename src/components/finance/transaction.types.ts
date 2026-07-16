export const TRANSACTION_TYPES = ["RECEITA", "DESPESA"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** Subconjunto usado no formulário (Pix / Cartão / Dinheiro). */
export const TRANSACTION_PAYMENT_METHODS = ["PIX", "CARTAO_CREDITO", "DINHEIRO"] as const;
export type TransactionPaymentMethod = (typeof TRANSACTION_PAYMENT_METHODS)[number];

export type TransactionFormValues = {
  description: string;
  amount: string;
  /** Vazio até o usuário escolher (categorias só carregam depois). */
  type: TransactionType | "";
  category_id: string;
  payment_method: TransactionPaymentMethod;
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  RECEITA: "Receita",
  DESPESA: "Despesa",
};

export const transactionPaymentMethodLabels: Record<TransactionPaymentMethod, string> = {
  PIX: "Pix",
  CARTAO_CREDITO: "Cartão",
  DINHEIRO: "Dinheiro",
};

export const transactionTypeOptions = TRANSACTION_TYPES.map((value) => ({
  value,
  label: transactionTypeLabels[value],
}));

export const transactionPaymentMethodOptions = TRANSACTION_PAYMENT_METHODS.map((value) => ({
  value,
  label: transactionPaymentMethodLabels[value],
}));

export type CreatedTransaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string;
  payment_method: string;
  transaction_date: string;
  member_id: string | null;
};
