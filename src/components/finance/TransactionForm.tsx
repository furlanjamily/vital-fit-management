"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle, CreditCard } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/app/(app)/finance/actions";
import { FormField, GlassButton, GlassInput, GlassSelect } from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import type { FinancialTransaction } from "@/components/finance/financial-transactions/financial-transaction.types";
import { TransactionCategorySelect } from "@/components/finance/TransactionCategorySelect";
import {
  formatAmountToBrlInput,
  formatBrlInput,
} from "@/components/finance/transaction.helpers";
import {
  transactionFormSchema,
  type TransactionFormSchemaOutput,
} from "@/components/finance/transaction.schema";
import {
  transactionPaymentMethodOptions,
  transactionTypeOptions,
  type TransactionFormValues,
  type TransactionPaymentMethod,
  type TransactionType,
} from "@/components/finance/transaction.types";
import { cn } from "@/lib/cn";
import { toastError, toastSuccess } from "@/lib/toast-utils";

function buildDefaultValues(): TransactionFormValues {
  return {
    description: "",
    amount: "",
    type: "RECEITA",
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

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues, unknown, TransactionFormSchemaOutput>({
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
  const hasType = transactionType === "RECEITA" || transactionType === "DESPESA";

  async function onSubmit(values: TransactionFormSchemaOutput) {
    const result = isEditing
      ? await updateTransactionAction(editingTransaction!.id, values)
      : await createTransactionAction(values);

    if (!result.success) {
      toastError(result.error);
      return;
    }

    toastSuccess(
      isEditing ? "Transação atualizada com sucesso!" : "Transação registrada com sucesso!",
    );
    onSuccess();
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onCancel}
      title={isEditing ? "Editar transação" : "Nova transação"}
      description={
        isEditing
          ? "Altere os dados do lançamento manual"
          : "(Mensalidades são lançadas automaticamente!)"
      }
      size="lg"
    >
      {hasType ? (
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
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Descrição" htmlFor="description" error={errors.description?.message}>
          <GlassInput
            id="description"
            placeholder={
              hasType
                ? DESCRIPTION_PLACEHOLDER[transactionType]
                : "Ex.: Compra de equipamentos, venda de suplementos…"
            }
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
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <GlassSelect
                  id="type"
                  options={transactionTypeOptions}
                  placeholder="Selecione o tipo"
                  invalid={Boolean(errors.type)}
                  value={field.value}
                  onChange={(event) => {
                    const nextType = event.target.value as TransactionType | "";
                    field.onChange(nextType);
                    setValue("category_id", "");
                  }}
                />
              )}
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
          <Controller
            name="payment_method"
            control={control}
            render={({ field }) => (
              <GlassSelect
                id="payment_method"
                leftIcon={CreditCard}
                options={transactionPaymentMethodOptions}
                invalid={Boolean(errors.payment_method)}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </FormField>

        <div className="flex gap-3 pt-2 justify-end">
          <GlassButton variant="subtle" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </GlassButton>

          <GlassButton
            type="submit"
            size="md"
            variant="subtle"
            disabled={isSubmitting}
            loading={isSubmitting}
            className={cn(
              isReceita
                ? "border-emerald-400/20 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                : "border-red-400/20 bg-red-500 text-red-100 hover:bg-red-500/25",
            )}
          >
            {isEditing ? "Salvar alterações" : "Registrar transação"}
          </GlassButton>
        </div>
      </form>
    </ResponsiveModal>
  );
}
