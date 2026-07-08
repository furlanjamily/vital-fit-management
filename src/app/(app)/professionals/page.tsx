import type { Metadata } from "next";
import { ProfessionalsContent } from "@/components/professionals/ProfessionalsContent";

export const metadata: Metadata = {
  title: "Profissionais | VitalFit Management",
  description: "Gestão e cadastro de personal trainers da academia.",
};

export default function ProfessionalsPage() {
  return <ProfessionalsContent />;
}
