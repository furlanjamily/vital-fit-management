import type { MemberPlan } from "@/components/members/members.types";

/** Valores padrão — espelham supabase/plans.sql (fallback se a tabela plans não existir). */
export const PLAN_PRICES: Record<MemberPlan, number> = {
  MENSAL_BASE: 89.9,
  TRIMESTRAL_PREMIUM: 229.9,
  ANUAL_PRO: 799.9,
};

export function resolvePlanPrice(plan: MemberPlan, fromDatabase?: number | null): number {
  if (fromDatabase != null && Number.isFinite(Number(fromDatabase))) {
    return Number(fromDatabase);
  }

  return PLAN_PRICES[plan];
}
