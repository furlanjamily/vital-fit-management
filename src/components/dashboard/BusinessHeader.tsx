import { Plus } from "lucide-react";

export function BusinessHeader() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-white">
          Controle seu espaço fitness favorito!
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1a1d19] transition hover:bg-white/92"
        >
          <Plus className="size-4" />
          Novo Aluno
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/18 bg-black/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
        >
          Nova Aula
        </button>
      </div>
    </div>
  );
}
