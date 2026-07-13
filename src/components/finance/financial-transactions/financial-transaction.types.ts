import type { TransactionType } from "@/components/finance/transaction.types";

export type FinancialTransaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  payment_method: string;
  transaction_date: string;
  category_id: string;
  category_name: string;
  category_color: string;
  member_id: string | null;
  /** Transações vinculadas a alunos (mensalidades) não podem ser editadas/excluídas aqui. */
  is_membership: boolean;
};
