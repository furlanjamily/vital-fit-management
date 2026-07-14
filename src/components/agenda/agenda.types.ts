export const EVENT_TYPES = ["reuniao", "tarefa", "compromisso"] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  type: EventType;
  meeting_link: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
};

export type EventParticipantRow = {
  event_id: string;
  user_id: string;
};

export type EventParticipant = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

export type AgendaEvent = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  type: EventType;
  meetingLink: string | null;
  location: string | null;
  createdBy: string;
  participants: EventParticipant[];
};

export type AgendaUserOption = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export const eventTypeLabels: Record<EventType, string> = {
  reuniao: "Reunião",
  tarefa: "Tarefa",
  compromisso: "Compromisso",
};

export const eventTypeOptions = EVENT_TYPES.map((value) => ({
  value,
  label: eventTypeLabels[value],
}));

export const eventTypeColors: Record<
  EventType,
  { background: string; border: string; text: string }
> = {
  reuniao: {
    background: "rgba(186, 224, 255, 0.92)",
    border: "rgba(120, 180, 230, 0.45)",
    text: "#1a3a52",
  },
  tarefa: {
    background: "rgba(191, 240, 211, 0.92)",
    border: "rgba(100, 190, 140, 0.45)",
    text: "#1a3d2e",
  },
  compromisso: {
    background: "rgba(255, 223, 160, 0.92)",
    border: "rgba(230, 180, 80, 0.45)",
    text: "#4a3510",
  },
};

export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && (EVENT_TYPES as readonly string[]).includes(value);
}
