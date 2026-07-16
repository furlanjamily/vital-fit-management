import { z } from "zod";
import { parseBrlAmount } from "@/components/finance/transaction.helpers";
import {
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/components/finance/transaction.types";

export const transactionFormSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição."),
  amount: z
    .string()
    .trim()
    .min(1, "Informe o valor.")
    .refine((value) => {
      const parsed = parseBrlAmount(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Informe um valor válido maior que zero."),
  type: z
    .union([z.literal(""), z.enum(TRANSACTION_TYPES)])
    .refine((value): value is TransactionType => value !== "", {
      message: "Selecione o tipo.",
    }),
  category_id: z.string().uuid("Selecione a categoria."),
  payment_method: z.enum(TRANSACTION_PAYMENT_METHODS, "Forma de pagamento inválida."),
});

export type TransactionFormSchemaOutput = z.output<typeof transactionFormSchema>;

export type ValidatedTransactionForm = {
  description: string;
  amount: number;
  type: TransactionFormSchemaOutput["type"];
  category_id: string;
  payment_method: TransactionFormSchemaOutput["payment_method"];
  member_id: null;
};

export function toValidatedTransactionForm(
  data: TransactionFormSchemaOutput,
): ValidatedTransactionForm {
  return {
    description: data.description,
    amount: parseBrlAmount(data.amount),
    type: data.type,
    category_id: data.category_id,
    payment_method: data.payment_method,
    member_id: null,
  };
}
