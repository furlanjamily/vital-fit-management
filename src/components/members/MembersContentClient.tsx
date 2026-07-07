"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  MoreVertical,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import {
  deleteMemberAction,
  updateMemberStatusAction,
} from "@/app/(app)/members/actions";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { ReusableTable, type TableColumn } from "@/components/common/table/reusable-table";
import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";
import {
  originLabels,
  planLabels,
  type ManagedMember,
} from "@/components/members/members.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import { cn } from "@/lib/cn";

type MembersContentClientProps = {
  initialMembers: ManagedMember[];
  loadError?: string | null;
};

type RowActionsProps = {
  member: ManagedMember;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRequestRemove: () => void;
  disabled?: boolean;
};

function RowActions({
  member,
  onEdit,
  onToggleStatus,
  onRequestRemove,
  disabled = false,
}: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const isActive = member.status === "active";

  const items = [
    {
      label: "Editar",
      icon: Edit3,
      onClick: onEdit,
      className: "text-white/75 hover:text-white",
    },
    {
      label: isActive ? "Inativar" : "Reativar",
      icon: isActive ? UserMinus : UserCheck,
      onClick: onToggleStatus,
      className: "text-white/75 hover:text-white",
    },
    {
      label: "Remover",
      icon: Trash2,
      onClick: onRequestRemove,
      className: "text-red-300/85 hover:text-red-200",
    },
  ];

  return (
    <div ref={containerRef} className="relative z-30 flex justify-end">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-label={`Ações para ${member.name}`}
        className="grid size-8 place-items-center rounded-full border border-white/14 bg-white/7 text-white/70 transition hover:bg-white/13 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreVertical className="size-3.5" />
      </button>

      {open && (
        <GlassPanel
          variant="strong"
          intensity="medium"
          elevation="modal"
          className="absolute right-0 top-10 z-50 w-40 rounded-xl bg-[#221d17]/92 p-1.5"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50",
                item.className,
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          ))}
        </GlassPanel>
      )}
    </div>
  );
}

type ConfirmRemoveModalProps = {
  member: ManagedMember;
  onConfirm: () => void;
  onCancel: () => void;
  removing?: boolean;
};

function ConfirmRemoveModal({
  member,
  onConfirm,
  onCancel,
  removing = false,
}: ConfirmRemoveModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <GlassPanel
        variant="strong"
        intensity="medium"
        elevation="modal"
        className="w-full max-w-sm rounded-2xl bg-[#221d17]/94 p-6"
      >
        <p className="text-sm font-semibold text-white">Remover aluno</p>
        <p className="mt-2 text-xs leading-relaxed text-white/48">
          Tem certeza que deseja remover{" "}
          <span className="font-semibold text-white/85">{member.name}</span>? Esta ação não
          pode ser desfeita.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={removing}
            className="rounded-xl border border-white/14 bg-white/7 px-4 py-2.5 text-xs font-semibold text-white/75 transition hover:bg-white/13 hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={removing}
            className="flex items-center gap-2 rounded-xl bg-red-400/90 px-4 py-2.5 text-xs font-semibold text-[#1a0d0a] transition hover:bg-red-300 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
            {removing ? "Removendo..." : "Remover"}
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

export function MembersContentClient({
  initialMembers,
  loadError = null,
}: MembersContentClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<ManagedMember[]>(initialMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ManagedMember | null>(null);
  const [removingMember, setRemovingMember] = useState<ManagedMember | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateForm() {
    setEditingMember(null);
    setActionError(null);
    setFormOpen(true);
  }

  function openEditForm(member: ManagedMember) {
    setEditingMember(member);
    setActionError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMember(null);
    setActionError(null);
  }

  function handleFormSuccess(member: ManagedMember) {
    if (editingMember) {
      setMembers((current) =>
        current.map((item) => (item.id === member.id ? member : item)),
      );
    } else {
      setMembers((current) => [member, ...current]);
    }

    closeForm();
    router.refresh();
  }

  function toggleStatus(member: ManagedMember) {
    const nextActive = member.status !== "active";

    startTransition(async () => {
      setActionError(null);

      const result = await updateMemberStatusAction(member.id, nextActive);

      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      setMembers((current) =>
        current.map((item) => (item.id === member.id ? result.member : item)),
      );
      router.refresh();
    });
  }

  function removeMember(memberId: string) {
    startTransition(async () => {
      setActionError(null);

      const result = await deleteMemberAction(memberId);

      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      setMembers((current) => current.filter((member) => member.id !== memberId));
      if (editingMember?.id === memberId) closeForm();
      setRemovingMember(null);
      router.refresh();
    });
  }

  const columns: TableColumn<ManagedMember>[] = [
    {
      key: "name",
      header: "Aluno",
      searchValue: (member) =>
        `${member.name} ${member.email} ${member.cpf}`,
      render: (member) => (
        <div className="flex items-center gap-2.5">
          <UserAvatar
            name={member.name}
            avatarUrl={member.avatarUrl}
            className="size-8"
            textClassName="text-[10px]"
          />
          <div>
            <p className="text-xs font-semibold text-white">{member.name}</p>
            <p className="text-[10px] text-white/35">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "cpf",
      header: "CPF",
      searchValue: (member) => member.cpf,
      render: (member) => member.cpf,
    },
    {
      key: "origin",
      header: "Origem",
      searchValue: (member) => originLabels[member.origin],
      render: (member) => (
        <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[10px] font-medium text-white/65">
          {originLabels[member.origin]}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      searchValue: (member) => planLabels[member.plan],
      render: (member) => planLabels[member.plan],
    },
    {
      key: "status",
      header: "Status",
      searchValue: (member) => (member.status === "active" ? "Ativo" : "Inativo"),
      render: (member) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
            member.status === "active"
              ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300/80",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              member.status === "active" ? "bg-emerald-400" : "bg-red-400/70",
            )}
          />
          {member.status === "active" ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (member) => (
        <RowActions
          member={member}
          disabled={isPending}
          onEdit={() => openEditForm(member)}
          onToggleStatus={() => toggleStatus(member)}
          onRequestRemove={() => setRemovingMember(member)}
        />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 pb-24">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.72rem] font-semibold tracking-[-0.055em] text-white">
            Gestão de Alunos
          </h1>
          <p className="mt-1 text-sm text-white/48">
            Cadastre e gerencie as matrículas da academia
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1a1d19] transition hover:bg-white/92"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </button>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200/90"
        >
          {loadError}
        </p>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3 text-sm text-orange-200/90"
        >
          {actionError}
        </p>
      ) : null}

      <ReusableTable
        data={members}
        columns={columns}
        getRowId={(member) => member.id}
        title="Todos os alunos"
        searchPlaceholder="Buscar por nome, e-mail, CPF..."
        emptyMessage="Nenhum aluno encontrado."
        rowClassName={(member) => (member.status === "inactive" ? "opacity-50" : undefined)}
      />

      {formOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/40 p-4">
          <MemberRegistrationForm
            key={editingMember?.id ?? "new"}
            editingMember={editingMember}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        </div>
      )}

      {removingMember && (
        <ConfirmRemoveModal
          member={removingMember}
          removing={isPending}
          onConfirm={() => removeMember(removingMember.id)}
          onCancel={() => setRemovingMember(null)}
        />
      )}
    </div>
  );
}
