"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { IconButton } from "@/components/common/button/IconButton";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { weekdayLabels } from "@/components/settings/classes/schedule.types";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";
import type { ClassGradeSlot } from "@/services/class-manager";

type ClassGradeTooltipProps = {
  grade: ClassGradeSlot[];
};

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
        <li
          key={slot.id}
          className={cn(
            "rounded-xl border border-orange-400/30 bg-white/10 px-3 py-2 text-[11px]",
            glassText.primaryElevated,
          )}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{weekdayLabels[slot.dayOfWeek]}</span>
            <span className={glassText.muted}>·</span>
            <span className="font-mono">{slot.startTime}</span>
            <span className={glassText.muted}>·</span>
            <span>{slot.professionalName}</span>
          </div>
          <div className={cn("mt-1 flex flex-wrap items-center gap-2 text-[10px]", glassText.muted)}>
            <span className="rounded-full border border-white/10 px-1.5 py-0.5">
              {slot.professionalSpecialty}
            </span>
            <span>{slot.maxCapacity} vagas</span>
          </div>
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
          <GlassPanel
            variant="subtle"
            intensity="high"
            elevation="popover"
            className={cn(
              "overflow-hidden rounded-2xl p-4",
              "bg-[linear-gradient(155deg,rgba(255,255,255,0.2)_0%,rgba(255,240,220,0.12)_48%,rgba(44,28,18,0.55)_100%)]",
              "shadow-[0_22px_64px_rgba(42,28,17,0.36),0_8px_24px_rgba(255,255,255,0.06)]",
            )}
          >
            <p className={cn("mb-3 text-xs font-semibold uppercase tracking-wide", glassText.primaryElevated)}>
              Grade horária
            </p>
            <ClassGradeContent grade={grade} />
          </GlassPanel>
        ) : null}
      </div>
    </div>
  );
}
