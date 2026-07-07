"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { UserAvatar } from "@/components/users/UserAvatar";
import {
  roleOptions,
  type ManagedUser,
  type UserFormValues,
} from "@/components/users/users.types";
import { cn } from "@/lib/cn";

const inputClassName =
  "w-full rounded-xl border border-white/14 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/32 outline-none transition focus:border-white/28";

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER",
  avatarUrl: null,
};

type UserFormProps = {
  /** Usuário em edição. Quando presente, o formulário entra em modo de edição. */
  editingUser: ManagedUser | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: UserFormValues) => void;
  onCancelEdit: () => void;
};

/**
 * O componente pai deve passar `key={editingUser?.id ?? "new"}` para que o
 * estado inicial seja recalculado ao entrar/sair do modo de edição.
 */
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingUser !== null;

  function setField<K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function readImageFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setField("avatarUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    readImageFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    readImageFile(event.dataTransfer.files?.[0]);
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

        <button
          type="button"
          onClick={onCancelEdit}
          className="grid size-8 place-items-center rounded-full border border-white/14 bg-white/7 text-white/70 transition hover:bg-white/13 hover:text-white"
          aria-label="Fechar"
        >
          <X className="size-3.5" />
        </button>
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

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "group relative rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-white/40",
              isDragging && "scale-105",
            )}
            aria-label="Enviar foto de perfil"
          >
            <UserAvatar
              name={values.name}
              avatarUrl={values.avatarUrl}
              className="size-20"
              textClassName="text-xl"
            />
            <span
              className={cn(
                "absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100",
                isDragging && "opacity-100",
              )}
            >
              <Camera className="size-5" />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </button>
        </div>

        <p className="text-center text-[10px] text-white/40">
          Clique ou arraste uma imagem — sem foto, usamos as iniciais do nome
        </p>

        <div className="relative">
          <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Nome completo"
            className={inputClassName}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="E-mail"
            autoComplete="off"
            className={inputClassName}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(event) => setField("password", event.target.value)}
            placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
            autoComplete="new-password"
            className={cn(inputClassName, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-white/40 transition hover:text-white/75"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="relative">
          <Shield className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <select
            value={values.role}
            onChange={(event) => setField("role", event.target.value as UserFormValues["role"])}
            className={cn(inputClassName, "appearance-none pr-9 [&>option]:bg-[#221d17]")}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
            ▾
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1a1d19] transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {submitting
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar usuário"}
        </button>
      </form>
    </GlassPanel>
  );
}
