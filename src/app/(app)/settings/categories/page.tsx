import type { Metadata } from "next";
import { CategoriesContent } from "@/components/settings/categories/CategoriesContent";

export const metadata: Metadata = {
  title: "Categorias | VitalFit Management",
  description: "Gerencie categorias de receitas e despesas do módulo financeiro.",
};

export default function CategoriesSettingsPage() {
  return <CategoriesContent />;
}
