"use client";

import { useEffect, useState, useTransition } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import {
  confirmMemberPaymentAction,
  getMemberPaymentPreviewAction,
  type MemberPaymentPreview,
} from "@/app/(app)/members/actions";
import { Button } from "@/components/common/button/Button";
import { GlassButton, GlassSelect } from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import {
  formatCurrencyBrl,
  formatIsoDateToDisplay,
  getPaymentStatus,
  isMembershipPaymentCurrent,
} from "@/components/members/member.helpers";
import {
  paymentMethodOptions,
  type PaymentMethod,
} from "@/components/members/payment.types";
import { planLabels, type ManagedMember } from "@/components/members/members.types";
import { resolvePlanPrice } from "@/config/plan-prices";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import { toastError, toastSuccess } from "@/lib/toast-utils";

type MemberPaymentFormProps = {
  member: ManagedMember;
  onSuccess: (member: ManagedMember) => void;
  onCancel: () => void;
};

function buildPreviewFromMember(member: ManagedMember): MemberPaymentPreview {
  const displayStatus = getPaymentStatus(member.nextDueDate, member.paymentStatus);

  return {
    id: member.id,
    name: member.name,
    plan: member.plan,
    planPrice: resolvePlanPrice(member.plan, member.planPrice),
    paymentStatus: member.paymentStatus,
    nextDueDate: member.nextDueDate,
    displayStatus,
    canConfirmPayment: !isMembershipPaymentCurrent(member.nextDueDate, member.paymentStatus),
  };
}

export function MemberPaymentForm({ member, onSuccess, onCancel }: MemberPaymentFormProps) {
  const [preview, setPreview] = useState<MemberPaymentPreview>(() =>
    buildPreviewFromMember(member),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startPreviewTransition(async () => {
      setLoadError(null);

      const result = await getMemberPaymentPreviewAction(member.id);

      if (!result.success) {
        setLoadError(result.error);
        toastError(result.error);
        setPreview(buildPreviewFromMember(member));
        return;
      }

      setPreview(result.data);
    });
  }, [member.id, member.name, member.plan, member.planPrice, member.paymentStatus, member.nextDueDate]);

  const paymentBlocked = !preview.canConfirmPayment;

  function handleConfirm() {
    if (paymentBlocked || isLoadingPreview) return;

    startTransition(async () => {
      const result = await confirmMemberPaymentAction(member.id, paymentMethod);

      if (!result.success) {
        toastError(result.error);
        return;
      }

      toastSuccess("Pagamento confirmado! A receita foi registrada automaticamente.");
      onSuccess(result.data);
    });
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onCancel}
      title="Pagamento de Mensalidade"
      description="Confirme o recebimento da mensalidade do aluno"
      size="md"
    >
      <div className="mb-5 space-y-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex justify-between gap-4 text-sm">
          <span className={glassText.muted}>Aluno</span>
          <span className={glassText.primary}>{preview.name}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className={glassText.muted}>Plano</span>
          <span className={glassText.primary}>{planLabels[preview.plan]}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className={glassText.muted}>Status</span>
          <span className={glassText.primary}>{preview.displayStatus}</span>
        </div>
        {preview.nextDueDate ? (
          <div className="flex justify-between gap-4 text-sm">
            <span className={glassText.muted}>Próximo vencimento</span>
            <span className={glassText.primary}>{formatIsoDateToDisplay(preview.nextDueDate)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-sm">
          <span className={glassText.muted}>Valor a pagar</span>
          {isLoadingPreview ? (
            <span className={cn("inline-flex items-center gap-2", glassText.muted)}>
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Carregando…
            </span>
          ) : (
            <span className="text-base font-semibold tracking-[-0.02em] text-orange-300">
              R$ {formatCurrencyBrl(preview.planPrice)}
            </span>
          )}
        </div>
      </div>

      {loadError ? (
        <p className={cn("mb-4 text-xs", glassText.muted)}>
          Não foi possível atualizar o valor pelo servidor. Exibindo valor estimado do plano.
        </p>
      ) : null}

      {paymentBlocked ? (
        <p
          role="status"
          className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          Este aluno está em dia com a mensalidade
          {preview.nextDueDate ? ` até ${formatIsoDateToDisplay(preview.nextDueDate)}` : ""}.
        </p>
      ) : null}

      {!paymentBlocked ? (
        <div className="mb-6">
          <label className={cn("mb-2 block text-xs font-medium", glassText.secondary)}>
            Forma de pagamento
          </label>
          <GlassSelect
            options={paymentMethodOptions}
            value={paymentMethod}
            leftIcon={CreditCard}
            disabled={isPending || isLoadingPreview}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          />
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <GlassButton variant="subtle" size="sm" onClick={onCancel} disabled={isPending}>
          Cancelar
        </GlassButton>

        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={isPending || isLoadingPreview || paymentBlocked}
          isLoading={isPending}
          onClick={handleConfirm}
        >
          {paymentBlocked ? "Mensalidade em dia" : "Confirmar Pagamento"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
