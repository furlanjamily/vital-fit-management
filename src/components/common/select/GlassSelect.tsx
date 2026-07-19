"use client";

import type { ChangeEvent, ReactNode, SelectHTMLAttributes } from "react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Branch as DismissableLayerBranch } from "@radix-ui/react-dismissable-layer";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  formControlFocusClassName,
  formControlInvalidClassName,
  inputPaddingPlain,
  inputPaddingWithIcon,
  inputSizeClasses,
  inputToneClasses,
  type FormControlSize,
  type InputTone,
} from "@/components/common/form/form.styles";
import { useHydrated } from "@/hooks/useHydrated";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export type GlassSelectOption = {
  value: string;
  label: string;
};

export type GlassSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options: GlassSelectOption[];
  leftIcon?: LucideIcon;
  selectSize?: FormControlSize;
  tone?: InputTone;
  invalid?: boolean;
  wrapperClassName?: string;
  placeholder?: string;
  /** Direção do painel — `top` evita corte no rodapé de tabelas. */
  placement?: "top" | "bottom";
};

type DropdownPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
};

export function GlassSelect({
  options,
  leftIcon: LeftIcon,
  selectSize = "md",
  tone = "default",
  invalid = false,
  wrapperClassName,
  className,
  disabled,
  placeholder = "Selecione…",
  value: valueProp,
  defaultValue,
  onChange,
  name,
  id,
  placement = "bottom",
  "aria-label": ariaLabel,
}: GlassSelectProps) {
  const hydrated = useHydrated();
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(
    () => String(defaultValue ?? valueProp ?? ""),
  );
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const hasLeftIcon = Boolean(LeftIcon);
  const chevronClassName = selectSize === "sm" ? "right-2 size-3" : "right-3.5 size-3.5";

  const value = isControlled ? String(valueProp ?? "") : internalValue;

  const selectedLabel = useMemo(() => {
    const selected = options.find((option) => option.value === value);
    if (selected) return selected.label;
    return placeholder ?? "";
  }, [options, placeholder, value]);

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 6;

    if (placement === "top") {
      setPosition({
        bottom: window.innerHeight - rect.top + gap,
        left: rect.left,
        width: rect.width,
      });
      return;
    }

    setPosition({
      top: rect.bottom + gap,
      left: rect.left,
      width: rect.width,
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (listboxRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function commitValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.({
      target: { value: nextValue, name: name ?? "" },
      currentTarget: { value: nextValue, name: name ?? "" },
    } as ChangeEvent<HTMLSelectElement>);

    setOpen(false);
  }

  const listbox =
    open && hydrated && position ? (
      // Branch: registra o portal no DismissableLayer do Dialog (hover/click + não fecha o modal).
      // pointer-events:auto: o Dialog seta pointer-events:none no body enquanto aberto.
      <DismissableLayerBranch
        ref={listboxRef}
        data-glass-portal="select"
        style={{
          position: "fixed",
          top: position.top,
          bottom: position.bottom,
          left: position.left,
          width: position.width,
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        <GlassPanel
          id={listboxId}
          role="listbox"
          variant="subtle"
          intensity="medium"
          elevation="popover"
          className="rounded-2xl p-0"
        >
          {/*
            1) Scroll num filho — GlassPanel usa overflow-hidden + wrapper h-full,
               então overflow-y-auto no próprio painel nunca ativa.
            2) Wheel manual — RemoveScroll do Radix Dialog faz preventDefault em
               portais no `body` (fora do lock); aplicamos o delta nós mesmos.
          */}
          <div
            className="flex max-h-56 flex-col gap-1.5 overflow-y-auto overscroll-contain p-2"
            onWheel={(event) => {
              const el = event.currentTarget;
              if (el.scrollHeight <= el.clientHeight) return;
              el.scrollTop += event.deltaY;
            }}
          >
            {placeholder && value === "" ? (
              <button
                type="button"
                role="option"
                aria-selected
                disabled
                className={cn(
                  "w-full cursor-default rounded-lg px-3 py-2 text-left text-[11px]",
                  glassText.muted,
                )}
              >
                {placeholder}
              </button>
            ) : null}

            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => commitValue(option.value)}
                  className={cn(
                    "w-full rounded-lg border border-transparent px-3 py-2 text-left text-[11px] font-medium transition",
                    selected
                      ? cn(
                          "border-white/16 bg-white/14 backdrop-blur-sm",
                          glassText.primary,
                        )
                      : cn(
                          glassText.secondary,
                          "hover:border-white/12 hover:bg-white/10 hover:text-glass-primary hover:backdrop-blur-sm",
                        ),
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </GlassPanel>
      </DismissableLayerBranch>
    ) : null;

  return (
    <div ref={containerRef} className={cn("relative", wrapperClassName)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      {LeftIcon ? (
        <LeftIcon
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2",
            glassText.tertiary,
          )}
        />
      ) : null}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className={cn(
          "flex w-full appearance-none items-center rounded-xl border text-left text-glass-primary",
          inputToneClasses[tone],
          inputSizeClasses[selectSize],
          hasLeftIcon ? inputPaddingWithIcon[selectSize] : inputPaddingPlain[selectSize],
          "pr-9",
          formControlFocusClassName,
          invalid && formControlInvalidClassName,
          disabled && "cursor-not-allowed opacity-60",
          !value && glassText.muted,
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
      </button>

      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 transition",
          glassText.tertiary,
          chevronClassName,
          open && "rotate-180",
        )}
      />

      {listbox ? createPortal(listbox, document.body) : null}
    </div>
  );
}

export type GlassSelectNativeProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  leftIcon?: LucideIcon;
  selectSize?: FormControlSize;
  tone?: InputTone;
  invalid?: boolean;
  wrapperClassName?: string;
  children: ReactNode;
};

/** Select nativo com children customizados (quando options prop não basta). */
export function GlassSelectNative({
  leftIcon: LeftIcon,
  selectSize = "md",
  tone = "default",
  invalid = false,
  wrapperClassName,
  className,
  disabled,
  children,
  ...props
}: GlassSelectNativeProps) {
  const hasLeftIcon = Boolean(LeftIcon);
  const chevronClassName = selectSize === "sm" ? "right-2 size-3" : "right-3.5 size-3.5";

  return (
    <div className={cn("relative", wrapperClassName)}>
      {LeftIcon ? (
        <LeftIcon className={cn("pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2", glassText.tertiary)} />
      ) : null}

      <select
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-xl border text-glass-primary",
          inputToneClasses[tone],
          inputSizeClasses[selectSize],
          hasLeftIcon ? inputPaddingWithIcon[selectSize] : inputPaddingPlain[selectSize],
          "pr-9 [&>option]:bg-[#8B6F4E] [&>option]:text-white",
          formControlFocusClassName,
          invalid && formControlInvalidClassName,
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2",
          glassText.tertiary,
          chevronClassName,
        )}
      />
    </div>
  );
}
