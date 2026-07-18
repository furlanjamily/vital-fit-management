import { z } from "zod";
import { PROFILE_SPECIALTIES } from "@/components/profile/profile.types";
import { stripPhone } from "@/components/profile/profile.helpers";
import { USER_ROLES } from "@/components/users/users.types";

const INVALID_USER_ID_MESSAGE =
  "ID de usuário inválido. Recarregue a página para sincronizar a lista.";

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => {
    const digits = stripPhone(value);
    return digits.length === 0 || digits.length >= 10;
  }, "Informe um telefone válido com DDD.");

const specialtySchema = z
  .string()
  .refine(
    (value) => (PROFILE_SPECIALTIES as readonly string[]).includes(value),
    "Selecione uma atuação válida.",
  );

const baseUserFields = {
  name: z.string().trim().min(1, "Informe o nome completo."),
  email: z.string().trim().pipe(z.email("Informe um e-mail válido.")),
  phone: phoneSchema,
  specialty: specialtySchema,
  role: z.enum(USER_ROLES, "Permissão inválida."),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value?.trim() || null),
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
