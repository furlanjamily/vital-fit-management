import { Plus } from "lucide-react";
import { GlassButton } from "@/components/common/form";
import { glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export function BusinessHeader() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className={cn(glassTextStyles.pageTitle, "text-[1.35rem] leading-tight tracking-[-0.04em]")}>
        Controle seu espaço fitness favorito!
      </h2>

      <div className="flex flex-col gap-2.5">
        <GlassButton variant="subtle" size="sm" leftIcon={<Plus className="size-3" />}>
          Novo Aluno
        </GlassButton>
      </div>
    </div>
  );
}
