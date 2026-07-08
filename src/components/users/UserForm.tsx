"use client";

import {
  useState,
  type FormEvent,
} from "react";
import { Eye, EyeOff, Lock, Mail, Shield, User, UserPlus, X } from "lucide-react";
import {
  AvatarUploadTrigger,
  GlassButton,
  GlassInput,
  GlassSelect,
  IconButton,
  SolidButton,
} from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import {
  roleOptions,
  type ManagedUser,
  type UserFormValues,
} from "@/components/users/users.types";

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER",
  avatarUrl: null,
};

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
    editingUser
      ? {
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role,
        avatarUrl: editingUser.avatarUrl,
      }
      : EMPTY_VALUES,
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
    <GlassPanel
      variant="strong"
      intensity="medium"
      elevation="modal"
      className="w-full max-w-md rounded-2xl bg-[#221d17]/94 p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">
            {isEditing ? "Editar usuário" : "Cadastrar usuário"}
          </p>
          <p className="mt-1 text-[11px] text-white/48">
            {isEditing
              ? `Alterando dados de ${editingUser.name}`
              : "Novo acesso ao VitalFit Management"}
          </p>
        </div>

        <IconButton
          aria-label="Fechar"
          className="bg-white/7 text-white/70 hover:bg-white/13 hover:text-white"
          onClick={onCancelEdit}
        >
          <X className="size-3.5" />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {errorMessage ? (
          <p
            role="alert"
            className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-xs text-orange-200/90"
          >
            {errorMessage}
          </p>
        ) : null}

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
              className="mr-1 size-8 border-0 bg-transparent text-white/40 hover:bg-transparent hover:text-white/75"
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
    </GlassPanel>
  );
}
