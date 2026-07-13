import { z } from "zod";
import { parseBrlAmount } from "@/components/finance/transaction.helpers";
import {
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_TYPES,
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
  type: z.enum(TRANSACTION_TYPES, "Tipo inválido."),
  category_id: z.string().uuid("Selecione a categoria."),
  payment_method: z.enum(TRANSACTION_PAYMENT_METHODS, "Forma de pagamento inválida."),
});

export type ValidatedTransactionForm = {
  description: string;
  amount: number;
  type: z.infer<typeof transactionFormSchema>["type"];
  category_id: string;
  payment_method: z.infer<typeof transactionFormSchema>["payment_method"];
  member_id: null;
};

export function toValidatedTransactionForm(
  data: z.infer<typeof transactionFormSchema>,
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
