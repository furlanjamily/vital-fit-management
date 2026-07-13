"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  deleteTransactionAction,
  getFinancialTransactionsAction,
} from "@/app/(app)/finance/actions";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import type { FinanceFilter } from "@/components/finance/finance.types";

export function useFinancialTransactions(
  filter: FinanceFilter,
  initialTransactions: FinancialTransaction[] = [],
) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [removingTransaction, setRemovingTransaction] = useState<FinancialTransaction | null>(null);
  const [isPending, startTransition] = useTransition();

  const reload = useCallback(
    (nextFilter: FinanceFilter = filter) => {
      startTransition(async () => {
        setFetchError(null);

        const result = await getFinancialTransactionsAction(nextFilter);

        if (!result.success) {
          setFetchError(result.error);
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
    setActionError(null);
    setEditingTransaction(transaction);
  }

  function closeEditForm() {
    setEditingTransaction(null);
    setActionError(null);
  }

  function handleEditSuccess() {
    closeEditForm();
    reload(filter);
  }

  function requestRemove(transaction: FinancialTransaction) {
    if (transaction.is_membership) return;
    setActionError(null);
    setRemovingTransaction(transaction);
  }

  function cancelRemove() {
    setRemovingTransaction(null);
  }

  function removeTransaction(transactionId: string) {
    startTransition(async () => {
      setActionError(null);

      const result = await deleteTransactionAction(transactionId);

      if (!result.success) {
        setActionError(result.error);
        return;
      }

      setTransactions((current) => current.filter((item) => item.id !== transactionId));
      if (editingTransaction?.id === transactionId) closeEditForm();
      setRemovingTransaction(null);
      reload(filter);
    });
  }

  return {
    transactions,
    fetchError,
    actionError,
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
