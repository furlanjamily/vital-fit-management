"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Activity,
  Calendar,
  CreditCard,
  Dumbbell,
  Loader2,
  Mail,
  User,
  UserPlus,
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
} from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { formatBirthDate, formatCpf } from "@/components/members/member.helpers";
import {
  originOptions,
  planOptions,
  unassignedProfessionalLabel,
  UNASSIGNED_PROFESSIONAL_VALUE,
  type ManagedMember,
  type MemberFormValues,
  type ProfessionalOption,
} from "@/components/members/members.types";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const EMPTY_VALUES: MemberFormValues = {
  name: "",
  email: "",
  cpf: "",
  birthDate: "",
  origin: "ACADEMIA",
  plan: "MENSAL_BASE",
  status: "active",
  avatarUrl: null,
  professionalId: null,
};

function buildInitialValues(editingMember: ManagedMember | null): MemberFormValues {
  if (!editingMember) return EMPTY_VALUES;

  const { name, email, cpf, birthDate, origin, plan, status, avatarUrl, professionalId } =
    editingMember;
  return { name, email, cpf, birthDate, origin, plan, status, avatarUrl, professionalId };
}

function buildProfessionalSelectOptions(
  professionalOptions: ProfessionalOption[],
  editingMember: ManagedMember | null,
) {
  const options = [
    { value: UNASSIGNED_PROFESSIONAL_VALUE, label: unassignedProfessionalLabel },
    ...professionalOptions.map((professional) => ({
      value: professional.id,
      label: professional.name,
    })),
  ];

  const currentId = editingMember?.professionalId;
  const isCurrentMissing =
    currentId && !professionalOptions.some((professional) => professional.id === currentId);

  if (isCurrentMissing && currentId) {
    options.push({
      value: currentId,
      label: editingMember?.professionalName ?? "Profissional inativo",
    });
  }

  return options;
}

type MemberRegistrationFormProps = {
  editingMember: ManagedMember | null;
  professionalOptions: ProfessionalOption[];
  onSuccess: (member: ManagedMember) => void;
  onCancel: () => void;
};

export function MemberRegistrationForm({
  editingMember,
  professionalOptions,
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
    <ResponsiveModal
      isOpen
      onClose={onCancel}
      title={isEditing ? "Editar aluno" : "Cadastrar aluno"}
      description={
        isEditing
          ? `Alterando matrícula de ${editingMember.name}`
          : "Nova matrícula na academia"
      }
      size="xl"
    >
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

          <div className="md:col-span-2">
            <p className={cn("mb-2 text-[11px] font-medium", glassText.secondary)}>
              Personal Trainer Responsável
            </p>
            <GlassSelect
              leftIcon={Dumbbell}
              options={buildProfessionalSelectOptions(professionalOptions, editingMember)}
              value={values.professionalId ?? UNASSIGNED_PROFESSIONAL_VALUE}
              onChange={(event) =>
                setField(
                  "professionalId",
                  event.target.value ? event.target.value : null,
                )
              }
              wrapperClassName="z-20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/14 bg-white/5 px-4 py-3">
          <div>
            <p className={cn("text-sm font-medium", glassText.primaryElevated)}>Status do aluno</p>
            <p className={cn("text-[11px]", glassText.muted)}>
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
    </ResponsiveModal>
  );
}
