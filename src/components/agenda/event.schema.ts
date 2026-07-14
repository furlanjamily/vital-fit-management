import { z } from "zod";
import { EVENT_TYPES } from "@/components/agenda/agenda.types";

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título do evento."),
    description: z.string().trim().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário de início inválido."),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário de término inválido."),
    type: z.enum(EVENT_TYPES, { message: "Selecione o tipo do evento." }),
    meetingLink: z.string().trim().url("Informe um link válido.").optional().or(z.literal("")),
    location: z.string().trim().optional(),
    participantIds: z.array(z.string().uuid()).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.endTime <= values.startTime) {
      ctx.addIssue({
        code: "custom",
        message: "O horário de término deve ser posterior ao início.",
        path: ["endTime"],
      });
    }

    if (values.type === "reuniao" && !values.meetingLink?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o link da reunião.",
        path: ["meetingLink"],
      });
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export type CreateEventFormValues = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: (typeof EVENT_TYPES)[number];
  meetingLink: string;
  location: string;
  participantIds: string[];
};
