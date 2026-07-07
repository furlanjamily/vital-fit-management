"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  Activity,
  Calendar,
  Camera,
  CreditCard,
  Mail,
  User,
  UserPlus,
  X,
} from "lucide-react";
import {
  createMemberAction,
  updateMemberAction,
} from "@/app/(app)/members/actions";
import { GlassButton } from "@/components/common/button/glass-button";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { formatBirthDate, formatCpf } from "@/components/members/member.helpers";
import {
  originOptions,
  planOptions,
  type ManagedMember,
  type MemberFormValues,
} from "@/components/members/members.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { cn } from "@/lib/cn";

const inputClassName =
  "w-full rounded-xl border border-white/14 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/32 outline-none transition focus:border-white/28";

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
    editingMember
      ? {
          name: editingMember.name,
          email: editingMember.email,
          cpf: editingMember.cpf,
          birthDate: editingMember.birthDate,
          origin: editingMember.origin,
          plan: editingMember.plan,
          status: editingMember.status,
          avatarUrl: editingMember.avatarUrl,
        }
      : EMPTY_VALUES,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingMember !== null;

  function setField<K extends keyof MemberFormValues>(
    field: K,
    value: MemberFormValues[K],
  ) {
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
    if (isPending) return;
    if (!values.name.trim() || !values.email.trim()) return;

    startTransition(async () => {
      setErrorMessage(null);

      const result = isEditing
        ? await updateMemberAction(editingMember.id, values)
        : await createMemberAction(values);

      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }

      onSuccess(result.member);
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

        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="grid size-8 place-items-center rounded-full border border-white/14 bg-white/7 text-white/70 transition hover:bg-white/13 hover:text-white disabled:opacity-50"
          aria-label="Fechar"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        {errorMessage ? (
          <p
            role="alert"
            className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-xs text-orange-200/90"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-2">
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
          <p className="text-center text-[10px] text-white/40">
            Clique ou arraste — sem foto, usamos as iniciais do nome
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="relative md:col-span-2">
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
            <CreditCard className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              inputMode="numeric"
              value={values.cpf}
              onChange={(event) => setField("cpf", formatCpf(event.target.value))}
              placeholder="CPF (000.000.000-00)"
              maxLength={14}
              className={inputClassName}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              inputMode="numeric"
              value={values.birthDate}
              onChange={(event) =>
                setField("birthDate", formatBirthDate(event.target.value))
              }
              placeholder="Data de nascimento (DD/MM/AAAA)"
              maxLength={10}
              className={inputClassName}
            />
          </div>

          <div className="relative z-20">
            <Activity className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <select
              value={values.origin}
              onChange={(event) =>
                setField("origin", event.target.value as MemberFormValues["origin"])
              }
              className={cn(inputClassName, "relative z-20 appearance-none pr-9 [&>option]:bg-[#221d17]")}
            >
              {originOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 z-20 -translate-y-1/2 text-white/40">
              ▾
            </span>
          </div>

          <div className="relative z-20">
            <Activity className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <select
              value={values.plan}
              onChange={(event) =>
                setField("plan", event.target.value as MemberFormValues["plan"])
              }
              className={cn(inputClassName, "relative z-20 appearance-none pr-9 [&>option]:bg-[#221d17]")}
            >
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 z-20 -translate-y-1/2 text-white/40">
              ▾
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/14 bg-white/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Status do aluno</p>
            <p className="text-[11px] text-white/40">
              {values.status === "active" ? "Matrícula ativa" : "Matrícula inativa"}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={values.status === "active"}
            onClick={() =>
              setField("status", values.status === "active" ? "inactive" : "active")
            }
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full border transition",
              values.status === "active"
                ? "border-emerald-400/40 bg-emerald-400/30"
                : "border-white/20 bg-white/10",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                values.status === "active" ? "left-[calc(100%-1.375rem)]" : "left-0.5",
              )}
            />
          </button>
        </div>

        <GlassButton
          type="submit"
          variant="default"
          shape="rounded"
          fullWidth
          loading={isPending}
          leftIcon={!isPending ? <UserPlus className="size-4" /> : undefined}
        >
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar aluno"}
        </GlassButton>
      </form>
    </GlassPanel>
  );
}
