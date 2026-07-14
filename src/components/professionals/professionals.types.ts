export const PROFESSIONAL_GENDERS = ["Male", "Female", "Other"] as const;
export const PROFESSIONAL_SHIFTS = ["Morning", "Afternoon", "Night", "FullTime"] as const;
export const PROFESSIONAL_STATUSES = ["active", "inactive"] as const;

export type { ProfessionalSpecialty } from "@/config/professional-specialties";
export { PROFESSIONAL_SPECIALTIES, specialtyOptions } from "@/config/professional-specialties";
import type { ProfessionalSpecialty } from "@/config/professional-specialties";

export type ProfessionalGender = (typeof PROFESSIONAL_GENDERS)[number];
export type ProfessionalShift = (typeof PROFESSIONAL_SHIFTS)[number];
export type ProfessionalStatus = (typeof PROFESSIONAL_STATUSES)[number];

export type ProfessionalRow = {
  id: string;
  avatar_url: string | null;
  full_name: string;
  email: string;
  cref: string;
  birth_date: string;
  gender: ProfessionalGender;
  shift: ProfessionalShift;
  specialty: ProfessionalSpecialty;
  status: boolean;
  created_at: string;
};

export type ProfessionalRowWithMemberCount = ProfessionalRow & {
  members: { count: number }[];
};

export type ManagedProfessional = {
  id: string;
  name: string;
  email: string;
  cref: string;
  birthDate: string;
  gender: ProfessionalGender;
  shift: ProfessionalShift;
  specialty: ProfessionalSpecialty;
  status: ProfessionalStatus;
  avatarUrl: string | null;
  memberCount: number;
};

export type ProfessionalFormValues = {
  name: string;
  email: string;
  cref: string;
  birthDate: string;
  gender: ProfessionalGender;
  shift: ProfessionalShift;
  specialty: ProfessionalSpecialty;
  status: ProfessionalStatus;
  avatarUrl: string | null;
};

export type ScheduleProfessionalOption = {
  id: string;
  name: string;
  specialty: ProfessionalSpecialty;
  status: ProfessionalStatus;
};

export const genderLabels: Record<ProfessionalGender, string> = {
  Male: "Masculino",
  Female: "Feminino",
  Other: "Outro",
};

export const shiftLabels: Record<ProfessionalShift, string> = {
  Morning: "Manhã",
  Afternoon: "Tarde",
  Night: "Noite",
  FullTime: "Integral",
};

export const statusLabels: Record<ProfessionalStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export const genderOptions = PROFESSIONAL_GENDERS.map((value) => ({
  value,
  label: genderLabels[value],
}));

export const shiftOptions = PROFESSIONAL_SHIFTS.map((value) => ({
  value,
  label: shiftLabels[value],
}));
