import { toast } from "sonner";

/** Feedback de sucesso padronizado (pt-BR) via Sonner. */
export function toastSuccess(message: string) {
  toast.success(message);
}

/** Feedback de erro padronizado (pt-BR) via Sonner — inclui erros Zod das Server Actions. */
export function toastError(message: string) {
  toast.error(message);
}
