import type { Metadata } from "next";
import { MembersContent } from "@/components/members/MembersContent";

export const metadata: Metadata = {
  title: "Alunos | VitalFit Management",
  description: "Gestão e cadastro de alunos da academia.",
};

export default function MembersPage() {
  return <MembersContent />;
}
