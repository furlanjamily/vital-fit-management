export type EnrollmentOrigin = "ACADEMIA" | "GYMPASS" | "TOTALPASS";

export type MemberPlan = "MENSAL_BASE" | "TRIMESTRAL_PREMIUM" | "ANUAL_PRO";

export type MemberStatus = "active" | "inactive";

/** Linha exata retornada pelo Supabase (`public.members`). */
export type MemberRow = {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  birth_date: string;
  origin: EnrollmentOrigin;
  plan: MemberPlan | null;
  status: boolean;
  avatar_url: string | null;
  created_at: string;
};

/** Modelo de domínio usado pela UI (Table, formulário). */
export type ManagedMember = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  origin: EnrollmentOrigin;
  plan: MemberPlan;
  status: MemberStatus;
  avatarUrl: string | null;
};

export type MemberFormValues = {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  origin: EnrollmentOrigin;
  plan: MemberPlan;
  status: MemberStatus;
  avatarUrl: string | null;
};

/** Payload validado enviado às Server Actions. */
export type MemberFormData = MemberFormValues;

export const ENROLLMENT_ORIGINS: EnrollmentOrigin[] = [
  "ACADEMIA",
  "GYMPASS",
  "TOTALPASS",
];

export const MEMBER_PLANS: MemberPlan[] = [
  "MENSAL_BASE",
  "TRIMESTRAL_PREMIUM",
  "ANUAL_PRO",
];

export const originLabels: Record<EnrollmentOrigin, string> = {
  ACADEMIA: "Academia (Direto)",
  GYMPASS: "Gympass",
  TOTALPASS: "TotalPass",
};

export const planLabels: Record<MemberPlan, string> = {
  MENSAL_BASE: "Mensal Base",
  TRIMESTRAL_PREMIUM: "Trimestral Premium",
  ANUAL_PRO: "Anual Pro",
};

export const originOptions = (
  Object.entries(originLabels) as [EnrollmentOrigin, string][]
).map(([value, label]) => ({ value, label }));

export const planOptions = (
  Object.entries(planLabels) as [MemberPlan, string][]
).map(([value, label]) => ({ value, label }));
