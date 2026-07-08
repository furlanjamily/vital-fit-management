"use client";

import { Trash2 } from "lucide-react";
import { DangerButton, OutlineButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { ModalOverlay } from "@/components/common/modal/ModalOverlay";

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
      <GlassPanel
        variant="strong"
        intensity="medium"
        elevation="modal"
        className="w-full max-w-sm rounded-2xl bg-[#221d17]/94 p-6"
      >
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-2 text-xs leading-relaxed text-white/48">
          Tem certeza que deseja remover{" "}
          <span className="font-semibold text-white/85">{subjectName}</span>? Esta ação
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
      </GlassPanel>
    </ModalOverlay>
  );
}
