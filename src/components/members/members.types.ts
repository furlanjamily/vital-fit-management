export const ENROLLMENT_ORIGINS = ["ACADEMIA", "GYMPASS", "TOTALPASS"] as const;
export const MEMBER_PLANS = ["MENSAL_BASE", "TRIMESTRAL_PREMIUM", "ANUAL_PRO"] as const;
export const MEMBER_STATUSES = ["active", "inactive"] as const;

export type EnrollmentOrigin = (typeof ENROLLMENT_ORIGINS)[number];
export type MemberPlan = (typeof MEMBER_PLANS)[number];
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

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
  payment_status: boolean;
  last_payment_date: string | null;
  next_due_date: string | null;
  last_payment_method: string | null;
  avatar_url: string | null;
  professional_id: string | null;
  created_at: string;
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
  professionalId: string | null;
};

export type ProfessionalOption = {
  id: string;
  name: string;
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
  professionalId: string | null;
  professionalName: string | null;
  paymentStatus: boolean;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  planPrice: number;
};

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

export const statusLabels: Record<MemberStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export const membershipPaymentLabels = {
  pending: "Pendente",
  current: "Em dia",
} as const;

/** @deprecated Use membershipPaymentLabels */
export const paymentStatusLabels = membershipPaymentLabels;

export const UNASSIGNED_PROFESSIONAL_VALUE = "";

export const unassignedProfessionalLabel = "Sem professor vinculado";

export const originOptions = ENROLLMENT_ORIGINS.map((value) => ({
  value,
  label: originLabels[value],
}));

export const planOptions = MEMBER_PLANS.map((value) => ({
  value,
  label: planLabels[value],
}));
