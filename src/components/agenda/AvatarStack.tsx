"use client";

import { UserAvatar } from "@/components/users/UserAvatar";
import type { EventParticipant } from "@/components/agenda/agenda.types";
import { cn } from "@/lib/cn";

type AvatarStackProps = {
  participants: EventParticipant[];
  maxVisible?: number;
  sizeClassName?: string;
  textClassName?: string;
  className?: string;
};

export function AvatarStack({
  participants,
  maxVisible = 3,
  sizeClassName = "size-5",
  textClassName = "text-[8px]",
  className,
}: AvatarStackProps) {
  if (participants.length === 0) return null;

  const visible = participants.slice(0, maxVisible);
  const overflow = participants.length - visible.length;
  const tooltip = participants.map((participant) => participant.name).join(", ");

  return (
    <div className={cn("group/stack relative flex shrink-0", className)} title={tooltip}>
      <div className="flex -space-x-1.5">
        {visible.map((participant, index) => (
          <span key={participant.userId} style={{ zIndex: visible.length - index }}>
            <UserAvatar
              name={participant.name}
              avatarUrl={participant.avatarUrl}
              className={cn(sizeClassName, "border-[1.5px] border-white/70")}
              textClassName={textClassName}
            />
          </span>
        ))}

        {overflow > 0 ? (
          <span
            className={cn(
              "grid place-items-center rounded-full border-[1.5px] border-white/70 bg-white/80 text-[9px] font-semibold text-[#1a1a1a]",
              sizeClassName,
            )}
            style={{ zIndex: 0 }}
          >
            +{overflow}
          </span>
        ) : null}
      </div>

      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 hidden max-w-[180px] rounded-lg",
          "border border-white/14 bg-[rgba(30,18,10,0.92)] px-2 py-1 text-[10px] text-white/90 shadow-lg",
          "group-hover/stack:block",
        )}
      >
        {tooltip}
      </div>
    </div>
  );
}
