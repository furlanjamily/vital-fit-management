"use client";

import { Trash2 } from "lucide-react";
import { Button, DangerButton } from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { glassText } from "@/config/glass-typography";
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
    <ResponsiveModal isOpen onClose={onCancel} title={title} size="sm">
      <p className={cn("text-xs leading-relaxed", glassText.secondaryElevated)}>
        Tem certeza que deseja remover{" "}
        <span className={cn(glassText.primaryElevated, "font-semibold")}>{subjectName}</span>? Esta ação
        não pode ser desfeita.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="glass" size="sm" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <DangerButton
          leftIcon={<Trash2 className="size-3.5" />}
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "Removendo..." : "Remover"}
        </DangerButton>
      </div>
    </ResponsiveModal>
  );
}
