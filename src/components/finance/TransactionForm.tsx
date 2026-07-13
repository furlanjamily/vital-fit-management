"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle, CreditCard, Loader2, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/app/(app)/finance/actions";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { FormField, GlassButton, GlassInput, GlassSelect, IconButton } from "@/components/common/form";
import { ModalPanel } from "@/components/common/modal/ModalPanel";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import { TransactionCategorySelect } from "@/components/finance/TransactionCategorySelect";
import {
  formatAmountToBrlInput,
  formatBrlInput,
} from "@/components/finance/transaction.helpers";
import { transactionFormSchema } from "@/components/finance/transaction.schema";
import {
  transactionPaymentMethodOptions,
  transactionTypeOptions,
  type TransactionFormValues,
  type TransactionPaymentMethod,
  type TransactionType,
} from "@/components/finance/transaction.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

function buildDefaultValues(type: TransactionType = "DESPESA"): TransactionFormValues {
  return {
    description: "",
    amount: "",
    type,
    category_id: "",
    payment_method: "PIX",
  };
}

function buildEditValues(transaction: FinancialTransaction): TransactionFormValues {
  const paymentMethod = transaction.payment_method as TransactionPaymentMethod;

  return {
    description: transaction.description,
    amount: formatAmountToBrlInput(transaction.amount),
    type: transaction.type,
    category_id: transaction.category_id,
    payment_method: transactionPaymentMethodOptions.some(
      (option) => option.value === paymentMethod,
    )
      ? paymentMethod
      : "PIX",
  };
}

const DESCRIPTION_PLACEHOLDER: Record<TransactionType, string> = {
  DESPESA: "Ex.: Compra de equipamentos, campanha de marketing…",
  RECEITA: "Ex.: Venda de suplementos, aula avulsa, convênio local…",
};

type TransactionFormProps = {
  editingTransaction?: FinancialTransaction | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TransactionForm({
  editingTransaction = null,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const isEditing = Boolean(editingTransaction);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: editingTransaction
      ? buildEditValues(editingTransaction)
      : buildDefaultValues(),
  });

  useEffect(() => {
    reset(
      editingTransaction ? buildEditValues(editingTransaction) : buildDefaultValues(),
    );
  }, [editingTransaction, reset]);

  const transactionType = watch("type");
  const isReceita = transactionType === "RECEITA";

  async function onSubmit(values: TransactionFormValues) {
    setSubmitError(null);
    setSuccessMessage(null);

    const result = isEditing
      ? await updateTransactionAction(editingTransaction!.id, values)
      : await createTransactionAction(values);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    setSuccessMessage(
      isEditing ? "Transação atualizada com sucesso!" : "Transação registrada com sucesso!",
    );
    window.setTimeout(onSuccess, 900);
  }

  return (
    <ModalPanel className="relative w-full max-w-lg">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className={glassTextStyles.modalTitle}>
            {isEditing ? "Editar transação" : "Nova transação"}
          </h2>
          <p className={cn("mt-1 text-sm", glassText.muted)}>
            {isEditing
              ? "Altere os dados do lançamento manual"
              : "Lançamentos avulsos — mensalidades são registradas em Alunos"}
          </p>
        </div>

        <IconButton
          shape="round"
          size="sm"
          aria-label="Fechar"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="size-4" />
        </IconButton>
      </div>

      <div
        className={cn(
          "mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
          isReceita
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-red-400/25 bg-red-400/10 text-red-300",
        )}
      >
        {isReceita ? (
          <ArrowUpCircle className="size-3.5" aria-hidden="true" />
        ) : (
          <ArrowDownCircle className="size-3.5" aria-hidden="true" />
        )}
        {isReceita ? "Receita" : "Despesa"}
      </div>

      {submitError ? <InlineAlert className="mb-4 text-xs">{submitError}</InlineAlert> : null}

      {successMessage ? (
        <p
          role="status"
          className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          {successMessage}
        </p>
      ) : null}

      {!successMessage ? (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
            <GlassInput
              id="description"
              placeholder={DESCRIPTION_PLACEHOLDER[transactionType]}
              invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </FormField>

          <FormField label="Valor (R$)" htmlFor="amount" error={errors.amount?.message}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <GlassInput
                  id="amount"
                  inputMode="decimal"
                  placeholder="0,00"
                  invalid={Boolean(errors.amount)}
                  value={field.value}
                  onChange={(event) => field.onChange(formatBrlInput(event.target.value))}
                />
              )}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tipo" htmlFor="type" error={errors.type?.message}>
              <GlassSelect
                id="type"
                options={transactionTypeOptions}
                invalid={Boolean(errors.type)}
                {...register("type")}
              />
            </FormField>

            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <TransactionCategorySelect
                  type={transactionType}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.category_id?.message}
                  invalid={Boolean(errors.category_id)}
                />
              )}
            />
          </div>

          <FormField
            label="Forma de pagamento"
            htmlFor="payment_method"
            error={errors.payment_method?.message}
          >
            <GlassSelect
              id="payment_method"
              leftIcon={CreditCard}
              options={transactionPaymentMethodOptions}
              invalid={Boolean(errors.payment_method)}
              {...register("payment_method")}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <GlassButton variant="subtle" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </GlassButton>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60",
                isReceita
                  ? "border-emerald-400/20 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                  : "border-red-400/20 bg-red-500/15 text-red-100 hover:bg-red-500/25",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Salvando…
                </>
              ) : isEditing ? (
                "Salvar alterações"
              ) : (
                "Registrar transação"
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end">
          <GlassButton variant="subtle" size="sm" onClick={onCancel}>
            Fechar
          </GlassButton>
        </div>
      )}
    </ModalPanel>
  );
}
