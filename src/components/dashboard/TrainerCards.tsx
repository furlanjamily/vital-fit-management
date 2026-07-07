import { ArrowUpRight } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";

const trainerAvatar =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=96&q=80";

function TrainerCard() {
  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className="rounded-2xl p-4"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="size-9 shrink-0 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${trainerAvatar})` }}
          />
          <div>
            <p className="text-sm font-semibold text-white">King Zarips</p>
            <p className="text-[11px] text-white/40">Personal Trainer</p>
          </div>
        </div>
        <button
          type="button"
          className="grid size-7 place-items-center rounded-full border border-white/14 bg-white/7 text-white/70 transition hover:bg-white/13 hover:text-white"
        >
          <ArrowUpRight className="size-3" />
        </button>
      </div>

      <div className="mb-3 flex gap-4">
        <div>
          <p className="text-sm font-semibold text-white">3+</p>
          <p className="text-[10px] text-white/40">Clients</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">2+</p>
          <p className="text-[10px] text-white/40">Years</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["Calisthenic", "Mentality", "+2"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-medium text-white/70"
          >
            {tag}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}

export function TrainerCards() {
  return (
    <>
      <TrainerCard />
      <TrainerCard />
    </>
  );
}
