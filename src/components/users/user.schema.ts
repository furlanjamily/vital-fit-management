import { z } from "zod";
import { USER_ROLES } from "@/components/users/users.types";

const INVALID_USER_ID_MESSAGE =
  "ID de usuário inválido. Recarregue a página para sincronizar a lista.";

const baseUserFields = {
  name: z.string().trim().min(1, "Informe o nome completo."),
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  role: z.enum(USER_ROLES, "Permissão inválida."),
};

export const createUserSchema = z.object({
  ...baseUserFields,
  password: z.string().min(1, "Informe uma senha."),
});

export const updateUserSchema = z.object({
  ...baseUserFields,
  id: z.uuid(INVALID_USER_ID_MESSAGE),
  password: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined),
});

export type CreateUserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.input<typeof updateUserSchema>;
