import { HeroProfileShowcase } from "@/components/landing/hero/panels/HeroProfileShowcase";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

/**
 * Flat glass plate: no extrusion, no side shadows.
 * Outer shell = GlassPanel. Inner div = hidden vertical scroll.
 */
export function RightProfilePanel() {
  return (
    <GlassPanel
      variant="hero"
      intensity="high"
      elevation="base"
      className="h-full w-full overflow-hidden rounded-[28px] shadow-2xl shadow-orange-950/20"
    >
      <div className="flex h-full flex-col overflow-y-auto p-5 pb-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <HeroProfileShowcase />
      </div>
    </GlassPanel>
  );
}
