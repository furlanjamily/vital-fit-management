"use client";

import type { ReactNode } from "react";
import { Calendar, Clock, Link2, MapPin, Tag, Trash2 } from "lucide-react";
import { AvatarStack } from "@/components/agenda/AvatarStack";
import {
  formatEventTimeRange,
  handleEventClick,
} from "@/components/agenda/agenda.helpers";
import {
  eventTypeColors,
  eventTypeLabels,
  type AgendaEvent,
} from "@/components/agenda/agenda.types";
import { DangerButton, GhostButton } from "@/components/common/form";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

type EventDetailModalProps = {
  event: AgendaEvent;
  onClose: () => void;
  onDelete: () => void;
};

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={cn("mt-0.5 size-4 shrink-0", glassText.tertiary)} strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[10px] font-semibold uppercase tracking-wide", glassText.muted)}>
          {label}
        </p>
        <div className={cn("mt-0.5 text-sm", glassText.primary)}>{children}</div>
      </div>
    </div>
  );
}

export function EventDetailModal({ event, onClose, onDelete }: EventDetailModalProps) {
  const colors = eventTypeColors[event.type];
  const hasMeetingLink = event.type === "reuniao" && Boolean(event.meetingLink);

  return (
    <ResponsiveModal isOpen onClose={onClose} title={event.title} size="md">
      <span
        className="mb-4 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold"
        style={{ backgroundColor: colors.background, color: colors.text }}
      >
        {eventTypeLabels[event.type]}
      </span>

      <div className="grid gap-4">
          <DetailRow icon={Clock} label="Horário">
            {formatEventTimeRange(event.startTime, event.endTime)}
          </DetailRow>

          {event.location ? (
            <DetailRow icon={MapPin} label="Local">
              {event.location}
            </DetailRow>
          ) : null}

          {event.description ? (
            <DetailRow icon={Tag} label="Descrição">
              {event.description}
            </DetailRow>
          ) : null}

          {event.participants.length > 0 ? (
            <DetailRow icon={Calendar} label="Participantes">
              <div className="flex items-center gap-2 pt-0.5">
                <AvatarStack
                  participants={event.participants}
                  maxVisible={5}
                  sizeClassName="size-7"
                  textClassName="text-[9px]"
                />
                <span className={cn("text-xs", glassText.muted)}>
                  {event.participants.map((participant) => participant.name).join(", ")}
                </span>
              </div>
            </DetailRow>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <DangerButton
            leftIcon={<Trash2 className="size-3.5" />}
            onClick={onDelete}
          >
            Excluir evento
          </DangerButton>

          <div className="flex items-center gap-2">
            {hasMeetingLink ? (
              <GhostButton onClick={() => handleEventClick(event)}>
                <span className="inline-flex items-center gap-1.5">
                  <Link2 className="size-3.5" />
                  Abrir reunião
                </span>
              </GhostButton>
            ) : null}
            <GhostButton onClick={onClose}>Fechar</GhostButton>
          </div>
        </div>
    </ResponsiveModal>
  );
}
