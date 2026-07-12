"use client";

import { Trash2 } from "lucide-react";
import { DangerButton, OutlineButton } from "@/components/common/form";
import { ModalOverlay } from "@/components/common/modal/ModalOverlay";
import { ModalPanel } from "@/components/common/modal/ModalPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type ConfirmRemoveDialogProps = {
  title: string;
  /** Nome do registro destacado na mensagem de confirmação. */
  subjectName: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmRemoveDialog({
  title,
  subjectName,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmRemoveDialogProps) {
  return (
    <ModalOverlay>
      <ModalPanel className="w-full max-w-sm">
        <p className={glassTextStyles.modalTitle}>{title}</p>
        <p className={cn("mt-2 text-xs leading-relaxed", glassText.secondaryElevated)}>
          Tem certeza que deseja remover{" "}
          <span className={cn(glassText.primaryElevated, "font-semibold")}>{subjectName}</span>? Esta ação
          não pode ser desfeita.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <OutlineButton onClick={onCancel} disabled={pending}>
            Cancelar
          </OutlineButton>
          <DangerButton
            leftIcon={<Trash2 className="size-3.5" />}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Removendo..." : "Remover"}
          </DangerButton>
        </div>
      </ModalPanel>
    </ModalOverlay>
  );
}
