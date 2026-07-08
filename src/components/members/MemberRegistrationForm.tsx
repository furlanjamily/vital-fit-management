"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Activity,
  Calendar,
  CreditCard,
  Loader2,
  Mail,
  User,
  UserPlus,
  X,
} from "lucide-react";
import {
  createMemberAction,
  updateMemberAction,
} from "@/app/(app)/members/actions";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  AvatarUploadTrigger,
  GlassButton,
  GlassInput,
  GlassSelect,
  GlassSwitch,
  IconButton,
} from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { formatBirthDate, formatCpf } from "@/components/members/member.helpers";
import {
  originOptions,
  planOptions,
  type ManagedMember,
  type MemberFormValues,
} from "@/components/members/members.types";

const EMPTY_VALUES: MemberFormValues = {
  name: "",
  email: "",
  cpf: "",
  birthDate: "",
  origin: "ACADEMIA",
  plan: "MENSAL_BASE",
  status: "active",
  avatarUrl: null,
};

function buildInitialValues(editingMember: ManagedMember | null): MemberFormValues {
  if (!editingMember) return EMPTY_VALUES;

  const { name, email, cpf, birthDate, origin, plan, status, avatarUrl } = editingMember;
  return { name, email, cpf, birthDate, origin, plan, status, avatarUrl };
}

type MemberRegistrationFormProps = {
  editingMember: ManagedMember | null;
  onSuccess: (member: ManagedMember) => void;
  onCancel: () => void;
};

export function MemberRegistrationForm({
  editingMember,
  onSuccess,
  onCancel,
}: MemberRegistrationFormProps) {
  const [values, setValues] = useState<MemberFormValues>(() =>
    buildInitialValues(editingMember),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = editingMember !== null;

  function setField<K extends keyof MemberFormValues>(
    field: K,
    value: MemberFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    if (!values.name.trim() || !values.email.trim()) return;

    startTransition(async () => {
      setErrorMessage(null);

      const result = isEditing
        ? await updateMemberAction(editingMember.id, values)
        : await createMemberAction(values);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      onSuccess(result.data);
    });
  }

  return (
    <GlassPanel
      variant="strong"
      intensity="medium"
      elevation="modal"
      className="relative z-50 w-full max-w-2xl rounded-2xl bg-[#221d17]/94 p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {isEditing ? "Editar aluno" : "Cadastrar aluno"}
          </p>
          <p className="mt-1 text-[11px] text-white/48">
            {isEditing
              ? `Alterando matrícula de ${editingMember.name}`
              : "Nova matrícula na academia"}
          </p>
        </div>

        <IconButton
          aria-label="Fechar"
          disabled={isPending}
          className="bg-white/7 text-white/70 hover:bg-white/13 hover:text-white"
          onClick={onCancel}
        >
          <X className="size-3.5" />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        {errorMessage ? <InlineAlert className="text-xs">{errorMessage}</InlineAlert> : null}

        <AvatarUploadTrigger
          name={values.name}
          avatarUrl={values.avatarUrl}
          onImageSelected={(dataUrl) => setField("avatarUrl", dataUrl)}
          hint="Clique ou arraste — sem foto, usamos as iniciais do nome"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassInput
            leftIcon={User}
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Nome completo"
            wrapperClassName="md:col-span-2"
          />

          <GlassInput
            leftIcon={Mail}
            type="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="E-mail"
            autoComplete="off"
          />

          <GlassInput
            leftIcon={CreditCard}
            inputMode="numeric"
            value={values.cpf}
            onChange={(event) => setField("cpf", formatCpf(event.target.value))}
            placeholder="CPF (000.000.000-00)"
            maxLength={14}
          />

          <GlassInput
            leftIcon={Calendar}
            inputMode="numeric"
            value={values.birthDate}
            onChange={(event) => setField("birthDate", formatBirthDate(event.target.value))}
            placeholder="Data de nascimento (DD/MM/AAAA)"
            maxLength={10}
          />

          <GlassSelect
            leftIcon={Activity}
            options={originOptions}
            value={values.origin}
            onChange={(event) =>
              setField("origin", event.target.value as MemberFormValues["origin"])
            }
            wrapperClassName="z-20"
          />

          <GlassSelect
            leftIcon={Activity}
            options={planOptions}
            value={values.plan}
            onChange={(event) =>
              setField("plan", event.target.value as MemberFormValues["plan"])
            }
            wrapperClassName="z-20"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/14 bg-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Status do aluno</p>
            <p className="text-[11px] text-white/40">
              {values.status === "active" ? "Matrícula ativa" : "Matrícula inativa"}
            </p>
          </div>

          <GlassSwitch
            checked={values.status === "active"}
            onCheckedChange={(checked) => setField("status", checked ? "active" : "inactive")}
          />
        </div>

        <div className="flex w-full justify-center">
          <GlassButton
            type="submit"
            variant="default"
            shape="rounded"
            loading={isPending}
            rightIcon={
              isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )
            }
          >
            {isPending
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar aluno"}
          </GlassButton>
        </div>
      </form>
    </GlassPanel>
  );
}
