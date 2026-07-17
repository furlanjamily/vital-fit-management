"use client";

import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "@/components/common/button/IconButton";
import { weekdayLabels } from "@/components/settings/classes/schedule.types";
import { glassText } from "@/config/glass-typography";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/cn";
import type { ClassGradeSlot } from "@/services/class-manager";

type ClassGradeTooltipProps = {
  grade: ClassGradeSlot[];
};

type PanelPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const VIEWPORT_MARGIN = 12;
const PANEL_GAP = 8;
const PANEL_MAX_WIDTH = 352; // 22rem

/** Card de slot — superfície plana (sem GlassPanel) para não empilhar blur. */
function GradeSlotCard({ slot }: { slot: ClassGradeSlot }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-[11px]">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-orange-300">{weekdayLabels[slot.dayOfWeek]}</span>
        <span className="text-white/25">·</span>
        <span className="font-mono font-medium text-amber-300">{slot.startTime}</span>
        <span className="text-white/25">·</span>
        <span className={cn("font-medium", glassText.primaryElevated)}>{slot.professionalName}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
        <span className="rounded-full border border-orange-400/30 bg-orange-500/15 px-1.5 py-0.5 font-medium text-orange-200">
          {slot.professionalSpecialty}
        </span>
        <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-200/90">
          {slot.maxCapacity} vagas
        </span>
      </div>
    </div>
  );
}

function ClassGradeContent({ grade }: { grade: ClassGradeSlot[] }) {
  if (grade.length === 0) {
    return (
      <p className={cn("text-sm leading-relaxed", glassText.muted)}>
        Nenhum horário configurado na grade para esta modalidade. Cadastre em Configurações →
        Grade de Aulas.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {grade.map((slot) => (
        <li key={slot.id}>
          <GradeSlotCard slot={slot} />
        </li>
      ))}
    </ul>
  );
}

function computePanelPosition(trigger: HTMLElement): PanelPosition {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(PANEL_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);

  // Em telas estreitas, usa quase a largura útil e centraliza.
  // Em telas maiores, alinha à direita do botão (como antes).
  const isCompact = viewportWidth < 640;
  let left = isCompact
    ? (viewportWidth - width) / 2
    : rect.right - width;

  left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(left, viewportWidth - width - VIEWPORT_MARGIN),
  );

  const spaceBelow = viewportHeight - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
  const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_MARGIN;
  const openBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;

  const maxHeight = Math.max(140, openBelow ? spaceBelow : spaceAbove);
  const top = openBelow
    ? rect.bottom + PANEL_GAP
    : Math.max(VIEWPORT_MARGIN, rect.top - PANEL_GAP - maxHeight);

  return { top, left, width, maxHeight };
}

export function ClassGradeTooltip({ grade }: ClassGradeTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();
  const hydrated = useHydrated();

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setPosition(computePanelPosition(trigger));
  }, []);

  const show = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setOpen(true);
  };

  const scheduleHide = () => {
    leaveTimerRef.current = setTimeout(() => setOpen(false), 140);
  };

  const toggle = () => setOpen((current) => !current);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

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
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const activeTriggerClass = "border-orange-400/30 bg-orange-400/10 text-orange-300";

  const panel =
    open && hydrated && position
      ? createPortal(
          <div
            ref={panelRef}
            id={tooltipId}
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              zIndex: 300,
            }}
            className="flex flex-col overflow-hidden"
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
          >
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/14 p-4",
                "bg-[rgba(46,38,30,0.97)]",
                "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_16px_40px_-12px_rgba(0,0,0,0.55)]",
              )}
            >
              <p className="mb-3 shrink-0 text-xs font-semibold uppercase tracking-wide text-orange-300/95">
                Grade horária
              </p>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
                <ClassGradeContent grade={grade} />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className="relative flex items-center gap-1"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <IconButton
        ref={triggerRef}
        type="button"
        aria-label="Ver grade horária"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={toggle}
        className={cn(open && activeTriggerClass)}
      >
        <CalendarDays className="size-3.5" aria-hidden="true" />
      </IconButton>

      {panel}
    </div>
  );
}
