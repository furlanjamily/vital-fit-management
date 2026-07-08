import { z } from "zod";
import { parseBirthDateToIso, stripCpf } from "@/components/members/member.helpers";
import {
  ENROLLMENT_ORIGINS,
  MEMBER_PLANS,
  MEMBER_STATUSES,
} from "@/components/members/members.types";

const CPF_DIGITS_LENGTH = 11;

export const memberFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome completo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
  cpf: z
    .string()
    .transform(stripCpf)
    .refine((cpf) => cpf.length === CPF_DIGITS_LENGTH, "Informe um CPF válido (11 dígitos)."),
  birthDate: z
    .string()
    .transform(parseBirthDateToIso)
    .pipe(z.string("Informe uma data de nascimento válida (DD/MM/AAAA).")),
  origin: z.enum(ENROLLMENT_ORIGINS, "Origem inválida."),
  plan: z.enum(MEMBER_PLANS, "Plano inválido."),
  status: z.enum(MEMBER_STATUSES, "Status inválido."),
  avatarUrl: z
    .string()
    .nullable()
    .transform((value) => value?.trim() || null),
});

/** Valores normalizados após validação (CPF sem máscara, data em ISO). */
export type ValidatedMemberForm = z.infer<typeof memberFormSchema>;
