"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deleteTransactionAction,
  getFinancialTransactionsAction,
} from "@/app/(app)/finance/actions";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import type { FinanceFilter } from "@/components/finance/finance.types";
import { toastError, toastSuccess } from "@/lib/toast-utils";

export function useFinancialTransactions(
  filter: FinanceFilter,
  initialTransactions: FinancialTransaction[] = [],
) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [removingTransaction, setRemovingTransaction] = useState<FinancialTransaction | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = useCallback(
    (nextFilter: FinanceFilter = filter) => {
      startTransition(async () => {
        const result = await getFinancialTransactionsAction(nextFilter);

        if (!result.success) {
          toastError(result.error);
          return;
        }

        setTransactions(result.data);
      });
    },
    [filter],
  );

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  useEffect(() => {
    reload(filter);
  }, [filter, reload]);

  function openEditForm(transaction: FinancialTransaction) {
    if (transaction.is_membership) return;
    setEditingTransaction(transaction);
  }

  function closeEditForm() {
    setEditingTransaction(null);
  }

  function handleEditSuccess() {
    closeEditForm();
    reload(filter);
  }

  function requestRemove(transaction: FinancialTransaction) {
    if (transaction.is_membership) return;
    setRemovingTransaction(transaction);
  }

  function cancelRemove() {
    setRemovingTransaction(null);
  }

  function removeTransaction(transactionId: string) {
    startTransition(async () => {
      const result = await deleteTransactionAction(transactionId);

      if (!result.success) {
        toastError(result.error);
        return;
      }

      setTransactions((current) => current.filter((item) => item.id !== transactionId));
      if (editingTransaction?.id === transactionId) closeEditForm();
      setRemovingTransaction(null);
      toastSuccess("Transação removida com sucesso.");
      reload(filter);
    });
  }

  return {
    transactions,
    isPending,
    editingTransaction,
    removingTransaction,
    reload,
    openEditForm,
    closeEditForm,
    handleEditSuccess,
    requestRemove,
    cancelRemove,
    removeTransaction,
  };
}
