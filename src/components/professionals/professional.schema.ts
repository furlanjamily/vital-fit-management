import { z } from "zod";
import {
  isValidCref,
  parseBirthDateToIso,
  stripCref,
} from "@/components/professionals/professional.helpers";
import {
  PROFESSIONAL_GENDERS,
  PROFESSIONAL_SHIFTS,
  PROFESSIONAL_STATUSES,
} from "@/components/professionals/professionals.types";

export const professionalFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome completo."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
  cref: z
    .string()
    .transform(stripCref)
    .refine(isValidCref, "Informe um CREF válido (ex: 123456-G/SP)."),
  birthDate: z
    .string()
    .transform(parseBirthDateToIso)
    .pipe(z.string("Informe uma data de nascimento válida (DD/MM/AAAA).")),
  gender: z.enum(PROFESSIONAL_GENDERS, "Sexo inválido."),
  shift: z.enum(PROFESSIONAL_SHIFTS, "Turno inválido."),
  status: z.enum(PROFESSIONAL_STATUSES, "Status inválido."),
  avatarUrl: z
    .string()
    .nullable()
    .transform((value) => value?.trim() || null),
});

export type ValidatedProfessionalForm = z.infer<typeof professionalFormSchema>;
