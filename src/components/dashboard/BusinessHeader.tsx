import { Plus } from "lucide-react";
import { GlassButton, OutlineButton, SolidButton } from "@/components/common/form";

export function BusinessHeader() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-white">
          Controle seu espaço fitness favorito!
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        <GlassButton variant="subtle" size="md" leftIcon={<Plus className="size-4" />}>
          Novo Aluno
        </GlassButton>
        {/* <OutlineButton className="w-full py-3 text-sm">Nova Aula</OutlineButton> */}
      </div>
    </div>
  );
}
