import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import type { TransactionType } from "@/components/finance/transaction.types";

type TransactionDbRow = {
  id: string;
  description: string;
  amount: number | string;
  type: string;
  payment_method: string;
  transaction_date: string;
  member_id: string | null;
  category_id: string;
  financial_categories?:
    | { id: string; name: string; color: string }
    | { id: string; name: string; color: string }[]
    | null;
  members?: { full_name: string } | { full_name: string }[] | null;
};

export function resolveTransactionDescription(
  description: string,
  memberId: string | null,
  memberName?: string | null,
): string {
  if (memberId && memberName?.trim()) {
    return `Mensalidade — ${memberName.trim()}`;
  }

  return description;
}

export function mapFinancialTransactionRow(row: TransactionDbRow): FinancialTransaction | null {
  const joined = row.financial_categories;
  const category = Array.isArray(joined) ? joined[0] : joined;
  if (!category) return null;

  const memberJoined = row.members;
  const member = Array.isArray(memberJoined) ? memberJoined[0] : memberJoined;

  return {
    id: row.id,
    description: resolveTransactionDescription(row.description, row.member_id, member?.full_name),
    amount: Number(row.amount),
    type: row.type as TransactionType,
    payment_method: row.payment_method,
    transaction_date: row.transaction_date,
    category_id: row.category_id,
    category_name: category.name,
    category_color: category.color,
    member_id: row.member_id,
    is_membership: row.member_id !== null,
  };
}

export function formatTransactionDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;

  return `${day}/${month}/${year}`;
}
