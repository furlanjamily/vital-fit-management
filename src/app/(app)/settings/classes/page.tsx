import type { Metadata } from "next";
import { ClassesScheduleContent } from "@/components/settings/classes/ClassesScheduleContent";

export const metadata: Metadata = {
  title: "Grade de Aulas | VitalFit Management",
  description: "Gerencie horários, professores e capacidade das turmas.",
};

export default function ClassesSettingsPage() {
  return <ClassesScheduleContent />;
}
