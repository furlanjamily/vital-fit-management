"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/common/button/IconButton";
import { weekdayLabels } from "@/components/settings/classes/schedule.types";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import type { ClassGradeSlot } from "@/services/class-manager";

type ClassGradeTooltipProps = {
  grade: ClassGradeSlot[];
};

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
    <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto scrollbar-none">
      {grade.map((slot) => (
        <li key={slot.id}>
          <GradeSlotCard slot={slot} />
        </li>
      ))}
    </ul>
  );
}

export function ClassGradeTooltip({ grade }: ClassGradeTooltipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

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

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const activeTriggerClass = "border-orange-400/30 bg-orange-400/10 text-orange-300";

  return (
    <div
      ref={rootRef}
      className="relative flex items-center gap-1"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <IconButton
        type="button"
        aria-label="Ver grade horária"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={toggle}
        className={cn(open && activeTriggerClass)}
      >
        <CalendarDays className="size-3.5" aria-hidden="true" />
      </IconButton>

      <div
        id={tooltipId}
        role="tooltip"
        className={cn(
          "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2.5rem))]",
          !open && "pointer-events-none",
        )}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
      >
        {open ? (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-white/14 p-4",
              // Opaco — evita glass-on-glass sobre o painel central
              "bg-[rgba(46,38,30,0.97)]",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_16px_40px_-12px_rgba(0,0,0,0.55)]",
            )}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-300/95">
              Grade horária
            </p>
            <ClassGradeContent grade={grade} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
