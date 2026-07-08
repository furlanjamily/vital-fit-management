import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`)
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula.")
    .regex(/\d/, "Deve conter pelo menos um número.")
    .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
