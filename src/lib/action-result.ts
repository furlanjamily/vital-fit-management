export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function actionFailure<T = null>(error: string): ActionResult<T> {
  return { success: false, error };
}

/** Normaliza exceções inesperadas para a mensagem de fallback em pt-BR. */
export function toActionError(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}
