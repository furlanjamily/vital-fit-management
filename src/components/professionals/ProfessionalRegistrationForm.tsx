"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Calendar,
  Clock,
  IdCard,
  Loader2,
  Mail,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createProfessionalAction,
  updateProfessionalAction,
} from "@/app/(app)/professionals/actions";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  AvatarUploadTrigger,
  GlassButton,
  GlassInput,
  GlassSelect,
  GlassSwitch,
  IconButton,
} from "@/components/common/form";
import { ModalPanel } from "@/components/common/modal/ModalPanel";
import {
  formatBirthDate,
  formatCref,
} from "@/components/professionals/professional.helpers";
import {
  genderOptions,
  shiftOptions,
  type ManagedProfessional,
  type ProfessionalFormValues,
} from "@/components/professionals/professionals.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const EMPTY_VALUES: ProfessionalFormValues = {
  name: "",
  email: "",
  cref: "",
  birthDate: "",
  gender: "Male",
  shift: "Morning",
  status: "active",
  avatarUrl: null,
};

function buildInitialValues(
  editingProfessional: ManagedProfessional | null,
): ProfessionalFormValues {
  if (!editingProfessional) return EMPTY_VALUES;

  const { name, email, cref, birthDate, gender, shift, status, avatarUrl } =
    editingProfessional;

  return { name, email, cref, birthDate, gender, shift, status, avatarUrl };
}

type ProfessionalRegistrationFormProps = {
  editingProfessional: ManagedProfessional | null;
  onSuccess: (professional: ManagedProfessional) => void;
  onCancel: () => void;
};

export function ProfessionalRegistrationForm({
  editingProfessional,
  onSuccess,
  onCancel,
}: ProfessionalRegistrationFormProps) {
  const [values, setValues] = useState<ProfessionalFormValues>(() =>
    buildInitialValues(editingProfessional),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = editingProfessional !== null;

  function setField<K extends keyof ProfessionalFormValues>(
    field: K,
    value: ProfessionalFormValues[K],
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
        ? await updateProfessionalAction(editingProfessional.id, values)
        : await createProfessionalAction(values);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      onSuccess(result.data);
    });
  }

  return (
    <ModalPanel className="relative z-50 w-full max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className={glassTextStyles.modalTitle}>
            {isEditing ? "Editar profissional" : "Cadastrar profissional"}
          </p>
          <p className={glassTextStyles.modalSubtitle}>
            {isEditing
              ? `Alterando cadastro de ${editingProfessional.name}`
              : "Novo personal trainer na academia"}
          </p>
        </div>

        <IconButton
          aria-label="Fechar"
          disabled={isPending}
          className={cn(
            "bg-white/7 text-glass-secondary hover:bg-white/13 hover:text-glass-primary",
          )}
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
            leftIcon={IdCard}
            value={values.cref}
            onChange={(event) => setField("cref", formatCref(event.target.value))}
            placeholder="CREF (123456-G/SP)"
            maxLength={12}
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
            leftIcon={Users}
            options={genderOptions}
            value={values.gender}
            onChange={(event) =>
              setField("gender", event.target.value as ProfessionalFormValues["gender"])
            }
            wrapperClassName="z-20"
          />

          <GlassSelect
            leftIcon={Clock}
            options={shiftOptions}
            value={values.shift}
            onChange={(event) =>
              setField("shift", event.target.value as ProfessionalFormValues["shift"])
            }
            wrapperClassName="z-20"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/14 bg-white/5 px-4 py-3">
          <div>
            <p className={cn("text-sm font-medium", glassText.primaryElevated)}>Status do profissional</p>
            <p className={cn("text-[11px]", glassText.muted)}>
              {values.status === "active" ? "Profissional ativo" : "Profissional inativo"}
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
                : "Cadastrar profissional"}
          </GlassButton>
        </div>
      </form>
    </ModalPanel>
  );
}
