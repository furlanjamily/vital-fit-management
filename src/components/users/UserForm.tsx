"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, Shield, User, UserPlus, X } from "lucide-react";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import {
  AvatarUploadTrigger,
  GlassButton,
  GlassInput,
  GlassSelect,
  IconButton,
} from "@/components/common/form";
import { ModalPanel } from "@/components/common/modal/ModalPanel";
import {
  roleOptions,
  type ManagedUser,
  type UserFormValues,
} from "@/components/users/users.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER",
  avatarUrl: null,
};

function buildInitialValues(editingUser: ManagedUser | null): UserFormValues {
  if (!editingUser) return EMPTY_VALUES;

  return {
    name: editingUser.name,
    email: editingUser.email,
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
    if (!isEditing && !values.password.trim()) return;

    onSubmit(values);
  }

  return (
    <ModalPanel className="w-full max-w-md">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className={glassTextStyles.modalTitle}>
            {isEditing ? "Editar usuário" : "Cadastrar usuário"}
          </p>
          <p className={glassTextStyles.modalSubtitle}>
            {isEditing
              ? `Alterando dados de ${editingUser.name}`
              : "Novo acesso ao VitalFit Management"}
          </p>
        </div>

        <IconButton
          aria-label="Fechar"
          className={cn(
            "bg-white/7 text-glass-secondary hover:bg-white/13 hover:text-glass-primary",
          )}
          onClick={onCancelEdit}
        >
          <X className="size-3.5" />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {errorMessage ? <InlineAlert className="text-xs">{errorMessage}</InlineAlert> : null}

        <AvatarUploadTrigger
          name={values.name}
          avatarUrl={values.avatarUrl}
          onImageSelected={(dataUrl) => setField("avatarUrl", dataUrl)}
        />

        <GlassInput
          leftIcon={User}
          value={values.name}
          onChange={(event) => setField("name", event.target.value)}
          placeholder="Nome completo"
          tone="muted"
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
          leftIcon={Lock}
          type={showPassword ? "text" : "password"}
          value={values.password}
          onChange={(event) => setField("password", event.target.value)}
          placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
          autoComplete="new-password"
          tone="muted"
          rightSlot={
            <IconButton
              shape="round"
              size="sm"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className={cn(
                "mr-1 size-8 border-0 bg-transparent hover:bg-transparent",
                glassText.tertiary,
                "hover:text-glass-secondary",
              )}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </IconButton>
          }
        />

        <GlassSelect
          leftIcon={Shield}
          options={roleOptions}
          value={values.role}
          onChange={(event) => setField("role", event.target.value as UserFormValues["role"])}
          tone="muted"
        />

        <div className="flex w-full justify-center">
          <GlassButton
            variant="subtle"
            size="md"
            type="submit"
            loading={submitting}
            rightIcon={!submitting ? <UserPlus className="size-4" /> : undefined}
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
    </ModalPanel>
  );
}
