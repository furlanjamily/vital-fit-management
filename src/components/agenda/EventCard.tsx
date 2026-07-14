"use client";

import { MapPin, Video } from "lucide-react";
import { AvatarStack } from "@/components/agenda/AvatarStack";
import {
  computeEventLayout,
  formatEventTimeRange,
} from "@/components/agenda/agenda.helpers";
import { eventTypeColors, type AgendaEvent } from "@/components/agenda/agenda.types";
import { cn } from "@/lib/cn";

type EventCardProps = {
  event: AgendaEvent;
  onSelect?: (event: AgendaEvent) => void;
  className?: string;
};

export function EventCard({ event, onSelect, className }: EventCardProps) {
  const layout = computeEventLayout(event.startTime, event.endTime);
  if (!layout) return null;

  const colors = eventTypeColors[event.type];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={cn(
        "absolute left-1 right-1 z-10 overflow-hidden rounded-xl border px-2 py-1.5 text-left shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition",
        "cursor-pointer hover:brightness-[0.97] hover:shadow-[0_6px_18px_rgba(0,0,0,0.1)]",
        className,
      )}
      style={{
        top: layout.top,
        height: layout.height,
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text,
      }}
      title={event.title}
    >
      <p className="truncate text-[11px] font-bold leading-tight">{event.title}</p>
      <p className="truncate text-[9px] opacity-75">
        {formatEventTimeRange(event.startTime, event.endTime)}
      </p>

      {layout.height >= 52 ? (
        <div className="mt-1 flex items-center justify-between gap-1">
          <AvatarStack participants={event.participants} sizeClassName="size-4" textClassName="text-[7px]" />

          <div className="flex items-center gap-1 opacity-70">
            {event.type === "reuniao" && event.meetingLink ? (
              <Video className="size-3 shrink-0" strokeWidth={2.25} />
            ) : null}
            {event.location ? <MapPin className="size-3 shrink-0" strokeWidth={2.25} /> : null}
          </div>
        </div>
      ) : null}
    </button>
  );
}
