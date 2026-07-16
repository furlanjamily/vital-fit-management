"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Users, X } from "lucide-react";
import type { AgendaUserOption } from "@/components/agenda/agenda.types";
import { UserAvatar } from "@/components/users/UserAvatar";
import {
  formControlFocusClassName,
  inputPaddingWithIcon,
  inputSizeClasses,
  inputToneClasses,
} from "@/components/common/form/form.styles";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type GlassMultiSelectProps = {
  options: AgendaUserOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Direção do painel — `top` evita corte no rodapé de modais. */
  placement?: "top" | "bottom";
};

export function GlassMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecionar participantes…",
  disabled = false,
  className,
  placement = "bottom",
}: GlassMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedUsers = useMemo(
    () => options.filter((option) => value.includes(option.id)),
    [options, value],
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function toggleUser(userId: string) {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
      return;
    }

    onChange([...value, userId]);
  }

  function removeUser(userId: string) {
    onChange(value.filter((id) => id !== userId));
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", open ? "z-[100]" : "z-0", className)}
    >
      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center rounded-xl border text-left",
          inputToneClasses.muted,
          inputSizeClasses.md,
          inputPaddingWithIcon.md,
          "pr-9",
          formControlFocusClassName,
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <Users className={cn("pointer-events-none absolute left-3.5 top-3 size-4", glassText.tertiary)} />

        <div className="flex min-h-6 flex-1 flex-wrap items-center gap-1.5 pl-7">
          {selectedUsers.length === 0 ? (
            <span className={cn("text-sm", glassText.muted)}>{placeholder}</span>
          ) : (
            selectedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/10 px-2 py-0.5 text-[11px]"
              >
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  className="size-4"
                  textClassName="text-[7px]"
                />
                <span className={glassText.primary}>{user.name.split(" ")[0]}</span>
                <button
                  type="button"
                  aria-label={`Remover ${user.name}`}
                  className={cn("rounded-full p-0.5 hover:bg-white/10", glassText.muted)}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeUser(user.id);
                  }}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3.5 top-3 size-4 transition",
            glassText.tertiary,
            open && "rotate-180",
          )}
        />
      </div>

      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 right-0 z-[110] max-h-56 w-full overflow-y-auto rounded-2xl p-1",
            // Superfície opaca — sem blur (já estamos dentro do modal glass)
            "border border-white/14 bg-[rgba(46,38,30,0.97)]",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_16px_40px_-12px_rgba(0,0,0,0.55)]",
            placement === "top"
              ? "bottom-[calc(100%+0.5rem)]"
              : "top-[calc(100%+0.5rem)]",
          )}
        >
          {options.length === 0 ? (
            <p className={cn("px-3 py-2 text-xs", glassText.muted)}>Nenhum usuário disponível.</p>
          ) : (
            options.map((option) => {
              const selected = value.includes(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggleUser(option.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-sm transition",
                    selected
                      ? "border-white/16 bg-white/12"
                      : "hover:border-white/10 hover:bg-white/[0.08]",
                  )}
                >
                  <UserAvatar
                    name={option.name}
                    avatarUrl={option.avatarUrl}
                    className="size-7"
                    textClassName="text-[10px]"
                  />
                  <span className={cn("min-w-0 flex-1 truncate", glassText.primary)}>
                    {option.name}
                  </span>
                  {selected ? <Check className="size-4 shrink-0 text-orange-400" /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
