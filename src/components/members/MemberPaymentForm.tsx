"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, CreditCard, Loader2, X } from "lucide-react";
import {
  confirmMemberPaymentAction,
  getMemberPaymentPreviewAction,
  type MemberPaymentPreview,
} from "@/app/(app)/members/actions";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassButton, GlassSelect, IconButton } from "@/components/common/form";
import { ModalPanel } from "@/components/common/modal/ModalPanel";
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
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startPreviewTransition(async () => {
      setLoadError(null);

      const result = await getMemberPaymentPreviewAction(member.id);

      if (!result.success) {
        setLoadError(result.error);
        setPreview(buildPreviewFromMember(member));
        return;
      }

      setPreview(result.data);
    });
  }, [member.id, member.name, member.plan, member.planPrice, member.paymentStatus, member.nextDueDate]);

  const paymentBlocked = !preview.canConfirmPayment;

  function handleConfirm() {
    if (paymentBlocked || isLoadingPreview) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await confirmMemberPaymentAction(member.id, paymentMethod);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setSuccessMessage("Pagamento confirmado! A receita foi registrada automaticamente.");
      window.setTimeout(() => onSuccess(result.data), 1200);
    });
  }

  return (
    <ModalPanel className="relative w-full max-w-md">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className={glassTextStyles.modalTitle}>Pagamento de Mensalidade</h2>
          <p className={cn("mt-1 text-sm", glassText.muted)}>
            Confirme o recebimento da mensalidade do aluno
          </p>
        </div>

        <IconButton
          shape="round"
          size="sm"
          aria-label="Fechar"
          onClick={onCancel}
          disabled={isPending}
        >
          <X className="size-4" />
        </IconButton>
      </div>

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

      {errorMessage ? <InlineAlert className="mb-4 text-xs">{errorMessage}</InlineAlert> : null}

      {successMessage ? (
        <p
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {successMessage}
        </p>
      ) : null}

      {!paymentBlocked && !successMessage ? (
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
          {successMessage ? "Fechar" : "Cancelar"}
        </GlassButton>

        {!successMessage ? (
          <button
            type="button"
            disabled={isPending || isLoadingPreview || paymentBlocked}
            onClick={handleConfirm}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold",
              "bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_12px_32px_rgba(249,115,22,0.28)]",
              glassText.primary,
              "transition hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Confirmando…
              </>
            ) : paymentBlocked ? (
              "Mensalidade em dia"
            ) : (
              "Confirmar Pagamento"
            )}
          </button>
        ) : null}
      </div>
    </ModalPanel>
  );
}
