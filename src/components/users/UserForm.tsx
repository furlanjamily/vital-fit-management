"use client";

import { useState, type FormEvent } from "react";
import { Briefcase, Eye, EyeOff, Lock, Mail, Phone, Shield, User } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  AvatarUploadTrigger,
  GlassButton,
  GlassInput,
  GlassSelect,
  IconButton,
} from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { formatPhone } from "@/components/profile/profile.helpers";
import {
  roleOptions,
  userSpecialtyOptions,
  type ManagedUser,
  type UserFormValues,
} from "@/components/users/users.types";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  phone: "",
  specialty: "",
  password: "",
  role: "MEMBER",
  avatarUrl: null,
};

function buildInitialValues(editingUser: ManagedUser | null): UserFormValues {
  if (!editingUser) return EMPTY_VALUES;

  return {
    name: editingUser.name,
    email: editingUser.email,
    phone: editingUser.phone,
    specialty: editingUser.specialty,
    password: "",
    role: editingUser.role,
    avatarUrl: editingUser.avatarUrl,
  };
}

type UserFormProps = {
  editingUser: ManagedUser | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: UserFormValues) => void;
  onCancelEdit: () => void;
};

export function UserForm({
  editingUser,
  submitting = false,
  errorMessage,
  onSubmit,
  onCancelEdit,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(() =>
    buildInitialValues(editingUser),
  );
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = editingUser !== null;

  function setField<K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!values.name.trim() || !values.email.trim()) return;
    if (!values.specialty.trim()) return;
    if (!isEditing && !values.password.trim()) return;

    onSubmit(values);
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onCancelEdit}
      title={isEditing ? "Editar usuário" : "Cadastrar usuário"}
      description={
        isEditing
          ? `Alterando dados de ${editingUser.name}`
          : "Novo acesso ao VitalFit Management"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {errorMessage ? <InlineAlert className="text-xs">{errorMessage}</InlineAlert> : null}

        <AvatarUploadTrigger
          name={values.name}
          avatarUrl={values.avatarUrl}
          onImageSelected={(dataUrl) => setField("avatarUrl", dataUrl)}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassInput
            leftIcon={User}
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Nome completo"
            tone="muted"
            wrapperClassName="md:col-span-2"
          />

          <GlassInput
            leftIcon={Mail}
            type="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="E-mail"
            autoComplete="off"
            tone="muted"
          />

          <GlassInput
            leftIcon={Phone}
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(event) => setField("phone", formatPhone(event.target.value))}
            placeholder="Telefone / WhatsApp"
            maxLength={15}
            tone="muted"
          />

          <GlassSelect
            leftIcon={Briefcase}
            options={userSpecialtyOptions}
            value={values.specialty}
            onChange={(event) => setField("specialty", event.target.value)}
            placeholder="Setor / Especialidade / Atuação"
            tone="muted"
            wrapperClassName="z-30"
          />

          <GlassSelect
            leftIcon={Shield}
            options={roleOptions}
            value={values.role}
            onChange={(event) => setField("role", event.target.value as UserFormValues["role"])}
            tone="muted"
            wrapperClassName="z-20"
          />

          <GlassInput
            leftIcon={Lock}
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(event) => setField("password", event.target.value)}
            placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
            autoComplete="new-password"
            tone="muted"
            wrapperClassName="md:col-span-2"
            rightSlot={
              <IconButton
                shape="round"
                size="sm"
                variant="ghost"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className={cn(
                  "mr-1 border-0 bg-transparent hover:bg-transparent",
                  glassText.tertiary,
                  "hover:text-glass-secondary",
                )}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </IconButton>
            }
          />
        </div>

        <div className="flex w-full justify-center">
          <GlassButton
            variant="subtle"
            size="md"
            type="submit"
            loading={submitting}
            className="mt-1"
          >
            {submitting
              ? "Salvando..."
              : isEditing
                ? "Salvar Alterações"
                : "Cadastrar Usuário"}
          </GlassButton>
        </div>
      </form>
    </ResponsiveModal>
  );
}
