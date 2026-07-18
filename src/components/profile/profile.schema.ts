import { z } from "zod";
import { PROFILE_SPECIALTIES } from "@/components/profile/profile.types";
import { stripPhone } from "@/components/profile/profile.helpers";

export const profileGeneralSchema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo."),
  email: z.email("E-mail inválido."),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = stripPhone(value);
      return digits.length === 0 || digits.length >= 10;
    }, "Informe um telefone válido com DDD."),
  specialty: z
    .string()
    .refine(
      (value) =>
        value === "" || (PROFILE_SPECIALTIES as readonly string[]).includes(value),
      "Selecione uma atuação válida.",
    ),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value?.trim() || null),
});

export type ProfileGeneralSchemaInput = z.input<typeof profileGeneralSchema>;
export type ProfileGeneralSchemaOutput = z.output<typeof profileGeneralSchema>;

export const profilePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
      .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
      .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula."),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["newPassword"],
  });

export type ProfilePasswordSchemaInput = z.input<typeof profilePasswordSchema>;
export type ProfilePasswordSchemaOutput = z.output<typeof profilePasswordSchema>;
