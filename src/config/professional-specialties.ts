/**
 * Especialidades de profissionais — devem coincidir com os nomes das modalidades
 * na grade para permitir o vínculo automático no agendamento.
 */
export const PROFESSIONAL_SPECIALTIES = [
  "Musculação",
  "Dança",
  "Yoga",
  "Spinning",
  "Jump",
  "Pilates",
  "Crossfit",
  "TRX",
] as const;

export type ProfessionalSpecialty = (typeof PROFESSIONAL_SPECIALTIES)[number];

export const specialtyOptions = PROFESSIONAL_SPECIALTIES.map((value) => ({
  value,
  label: value,
}));

/** Verifica se a especialidade do profissional corresponde à modalidade da aula. */
export function specialtyMatchesClass(
  specialty: string | null | undefined,
  className: string | null | undefined,
): boolean {
  if (!specialty?.trim() || !className?.trim()) return false;
  return specialty.trim().toLowerCase() === className.trim().toLowerCase();
}

/** SQL CHECK constraint — mantém sincronizado com PROFESSIONAL_SPECIALTIES. */
export const PROFESSIONAL_SPECIALTY_SQL_CHECK = PROFESSIONAL_SPECIALTIES.map(
  (value) => `'${value.replace(/'/g, "''")}'`,
).join(", ");
