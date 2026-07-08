import { SolidButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

export function MobileAppPromo() {
  return (
    <GlassPanel
      variant="strong"
      intensity="medium"
      elevation="floating"
      className="rounded-2xl p-5"
    >
      <h3 className="text-lg font-semibold leading-snug tracking-[-0.03em] text-white">
        Get the Mobile App now
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-white/42">
        Manage your business whenever you want with your thumbs
      </p>
      <SolidButton fullWidth className="mt-5">
        Download Now
      </SolidButton>
    </GlassPanel>
  );
}
