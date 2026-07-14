import Link from "next/link";
import { CalendarDays, ChevronRight, Tag } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

const SETTINGS_LINKS = [
  {
    href: "/settings/categories",
    title: "Categorias financeiras",
    description: "Receitas e despesas usadas no dashboard e nos lançamentos",
    icon: Tag,
  },
  {
    href: "/settings/classes",
    title: "Grade de Aulas",
    description: "Gerenciamento de horários, professores e capacidade das turmas",
    icon: CalendarDays,
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className={glassTextStyles.pageTitle}>Configurações</h1>
        <p className={cn("mt-1 text-sm", glassText.muted)}>
          Preferências e cadastros auxiliares do sistema
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
        {SETTINGS_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="group block">
            <GlassPanel
              variant="subtle"
              intensity="low"
              elevation="floating"
              className="flex h-full items-center gap-4 rounded-2xl p-5 transition group-hover:border-orange-400/25"
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10 text-orange-300">
                <item.icon className="size-5" aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className={cn("block font-semibold", glassText.primary)}>{item.title}</span>
                <span className={cn("mt-0.5 block text-sm", glassText.muted)}>{item.description}</span>
              </span>

              <ChevronRight
                className="size-5 shrink-0 text-white/35 transition group-hover:text-orange-300"
                aria-hidden="true"
              />
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
