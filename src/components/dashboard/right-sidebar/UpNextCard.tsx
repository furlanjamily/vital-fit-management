"use client";

import Link from "next/link";
import { Clock, CalendarDays } from "lucide-react";
import type { AgendaEvent } from "@/components/agenda/agenda.types";
import { eventTypeLabels } from "@/components/agenda/agenda.types";
import { formatUpNextSchedule } from "@/components/dashboard/right-sidebar/right-sidebar.helpers";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { GhostButton, OutlineButton } from "@/components/common/form";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type UpNextCardProps = {
  event: AgendaEvent | null;
  countdown: string | null;
  isLoading?: boolean;
  className?: string;
};

export function UpNextCard({ event, countdown, isLoading = false, className }: UpNextCardProps) {
  if (isLoading && !event) {
    return (
      <GlassPanel
        variant="subtle"
        intensity="low"
        elevation="floating"
        className={cn("w-full min-w-0 rounded-[20px] p-4", className)}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-5 w-full rounded bg-white/10" />
          <div className="h-8 w-full rounded bg-white/10" />
        </div>
      </GlassPanel>
    );
  }

  if (!event) {
    return (
      <GlassPanel
        variant="subtle"
        intensity="low"
        elevation="floating"
        className={cn("w-full min-w-0 rounded-[20px] p-4", className)}
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <CalendarDays className={cn("size-4", glassText.muted)} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("text-[10px] font-semibold uppercase tracking-wide", glassText.muted)}>
              Próximos eventos
            </p>
            <p className={cn("mt-1 text-sm font-semibold leading-snug", glassText.primary)}>
              Sem eventos para hoje
            </p>
            <p className={cn("mt-1.5 text-xs leading-relaxed", glassText.secondary)}>
              Sua agenda está livre. Crie um compromisso para manter a equipe alinhada.
            </p>
            <Link
              href="/agenda"
              className="mt-3 inline-flex text-xs font-semibold text-orange-600 transition hover:text-orange-500"
            >
              + Adicionar evento
            </Link>
          </div>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className={cn("w-full min-w-0 rounded-[20px] p-4", className)}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className={cn("min-w-0 text-[10px] font-semibold tabular-nums", glassText.muted)}>
          {formatUpNextSchedule(event)}
        </p>
        {countdown ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-400/25 bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-200">
            <Clock className="size-3" strokeWidth={2.25} />
            {countdown}
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          glassTextStyles.panelTitle,
          "text-sm font-bold leading-snug tracking-[-0.02em] break-words",
        )}
      >
        {event.title}
      </p>
      <p className={cn("mt-1 text-[10px] font-medium leading-relaxed", glassText.muted)}>
        {eventTypeLabels[event.type]}
        {event.location ? ` · ${event.location}` : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <OutlineButton
          className="rounded-full border-orange-400/30 px-3 py-1.5 text-[10px] font-semibold text-orange-200 hover:bg-orange-500/10"
          onClick={() => {}}
          disabled
        >
          Depois
        </OutlineButton>
        <Link href="/agenda" className="inline-flex">
          <GhostButton className="rounded-full bg-[linear-gradient(90deg,#FF7A4A_0%,#FF4D3D_100%)] px-4 py-1.5 text-[10px] font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.32)] hover:brightness-110">
            Detalhes
          </GhostButton>
        </Link>
      </div>
    </GlassPanel>
  );
}
