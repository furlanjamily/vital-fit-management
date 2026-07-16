import { Edit3, Trash2 } from "lucide-react";
import { RowActionsMenu, type RowAction } from "@/components/common/menu/RowActionsMenu";
import type { TableColumn, TableFilterDefinition } from "@/components/common/table/Table";
import { formatTransactionDate } from "@/components/finance/financial-transactions/financial-transaction.helpers";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import { formatBrlAmount } from "@/components/finance/finance.helpers";
import {
  transactionPaymentMethodLabels,
  transactionTypeLabels,
} from "@/components/finance/transaction.types";
import { paymentMethodLabels } from "@/components/members/payment.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

function resolvePaymentMethodLabel(method: string): string {
  if (method in transactionPaymentMethodLabels) {
    return transactionPaymentMethodLabels[method as keyof typeof transactionPaymentMethodLabels];
  }
  if (method in paymentMethodLabels) {
    return paymentMethodLabels[method as keyof typeof paymentMethodLabels];
  }
  return method;
}

function TransactionTypeBadge({ type }: { type: FinancialTransaction["type"] }) {
  const isReceita = type === "RECEITA";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
        isReceita
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-red-400/25 bg-red-400/10 text-red-300",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", isReceita ? "bg-emerald-400" : "bg-red-400/80")}
        aria-hidden
      />
      {transactionTypeLabels[type]}
    </span>
  );
}

function DescriptionCell({ description }: { description: string }) {
  return (
    <span className={cn(glassTextStyles.entityName, "block max-w-full truncate leading-snug")}>
      {description}
    </span>
  );
}

function CategoryCell({ transaction }: { transaction: FinancialTransaction }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2.5">
      <span
        className="size-2 shrink-0 rounded-[2px]"
        style={{ backgroundColor: transaction.category_color }}
        aria-hidden
      />
      <span className={cn(glassTextStyles.entityName, "truncate")}>{transaction.category_name}</span>
    </div>
  );
}

function AmountCell({ transaction }: { transaction: FinancialTransaction }) {
  const isReceita = transaction.type === "RECEITA";

  return (
    <span
      className={cn(
        "whitespace-nowrap font-semibold tabular-nums",
        isReceita ? "text-emerald-300" : "text-red-300",
      )}
    >
      {isReceita ? "+" : "-"} R$ {formatBrlAmount(transaction.amount)}
    </span>
  );
}

export const financialTransactionFilters: TableFilterDefinition<FinancialTransaction>[] = [
  {
    type: "text",
    key: "search",
    placeholder: "Buscar por descrição ou categoria…",
  },
  {
    type: "select",
    key: "type",
    placeholder: "Tipo",
    options: [
      { value: "RECEITA", label: transactionTypeLabels.RECEITA },
      { value: "DESPESA", label: transactionTypeLabels.DESPESA },
    ],
    match: (transaction) => transaction.type,
  },
];

type BuildFinancialTransactionColumnsOptions = {
  isPending: boolean;
  onEdit: (transaction: FinancialTransaction) => void;
  onRemove: (transaction: FinancialTransaction) => void;
};

function buildRowActions(
  transaction: FinancialTransaction,
  onEdit: (transaction: FinancialTransaction) => void,
  onRemove: (transaction: FinancialTransaction) => void,
): RowAction[] {
  if (transaction.is_membership) return [];

  return [
    { label: "Editar", icon: Edit3, onSelect: () => onEdit(transaction) },
    { label: "Excluir", icon: Trash2, tone: "danger", onSelect: () => onRemove(transaction) },
  ];
}

export function buildFinancialTransactionColumns({
  isPending,
  onEdit,
  onRemove,
}: BuildFinancialTransactionColumnsOptions): TableColumn<FinancialTransaction>[] {
  return [
    {
      key: "transaction_date",
      header: "Data",
      width: "13%",
      minWidth: "110px",
      align: "left",
      searchValue: (transaction) => formatTransactionDate(transaction.transaction_date),
      render: (transaction) => (
        <span className={cn("whitespace-nowrap text-sm tabular-nums", glassText.secondary)}>
          {formatTransactionDate(transaction.transaction_date)}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descrição",
      align: "center",
      minWidth: "180px",
      searchValue: (transaction) => transaction.description,
      render: (transaction) => <DescriptionCell description={transaction.description} />,
    },
    {
      key: "category",
      header: "Categoria",
      width: "15%",
      minWidth: "140px",
      align: "center",
      searchValue: (transaction) => transaction.category_name,
      render: (transaction) => <CategoryCell transaction={transaction} />,
    },
    {
      key: "type",
      header: "Tipo",
      width: "15%",
      minWidth: "120px",
      align: "center",
      searchValue: (transaction) => transactionTypeLabels[transaction.type],
      render: (transaction) => <TransactionTypeBadge type={transaction.type} />,
    },
    {
      key: "payment_method",
      header: "Pagamento",
      width: "20%",
      minWidth: "150px",
      align: "center",
      searchValue: (transaction) => resolvePaymentMethodLabel(transaction.payment_method),
      render: (transaction) => (
        <span className={cn("whitespace-nowrap text-sm", glassText.secondary)}>
          {resolvePaymentMethodLabel(transaction.payment_method)}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Valor",
      width: "14%",
      minWidth: "110px",
      align: "center",
      searchValue: (transaction) => String(transaction.amount),
      render: (transaction) => <AmountCell transaction={transaction} />,
    },
    {
      key: "actions",
      header: "",
      width: "4rem",
      minWidth: "64px",
      align: "right",
      sticky: "right",
      render: (transaction) => {
        const actions = buildRowActions(transaction, onEdit, onRemove);
        if (actions.length === 0) return null;

        return (
          <RowActionsMenu
            ariaLabel={`Ações para ${transaction.description}`}
            disabled={isPending}
            actions={actions}
          />
        );
      },
    },
  ];
}
