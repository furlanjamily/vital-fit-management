import { ArrowUpRight } from "lucide-react";
import { IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassTextStyles } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

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
            <p className={glassTextStyles.panelTitle}>King Zarips</p>
            <p className={glassTextStyles.kpiLabel}>Personal Trainer</p>
          </div>
        </div>
        <IconButton
          size="sm"
          aria-label="Ver perfil do personal"
          className="bg-white/7 hover:bg-white/13 hover:text-glass-primary"
        >
          <ArrowUpRight className="size-3" />
        </IconButton>
      </div>

      <div className="mb-3 flex gap-4">
        <div>
          <p className={glassTextStyles.panelTitle}>3+</p>
          <p className={cn(glassTextStyles.kpiLabel, "text-[10px]")}>Clients</p>
        </div>
        <div>
          <p className={glassTextStyles.panelTitle}>2+</p>
          <p className={cn(glassTextStyles.kpiLabel, "text-[10px]")}>Years</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["Calisthenic", "Mentality", "+2"].map((tag) => (
          <span
            key={tag}
            className={cn("rounded-full border border-white/12 bg-white/8 px-2.5 py-1", glassTextStyles.badge)}
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
