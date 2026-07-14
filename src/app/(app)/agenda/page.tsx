import type { Metadata } from "next";
import { AgendaContent } from "@/components/agenda/AgendaContent";

export const metadata: Metadata = {
  title: "Agenda | VitalFit Management",
  description: "Agenda colaborativa de reuniões, tarefas e compromissos.",
};

export default function AgendaPage() {
  return <AgendaContent />;
}
