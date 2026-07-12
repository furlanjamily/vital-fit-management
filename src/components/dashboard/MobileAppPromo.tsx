import { SolidButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText } from "@/config/glass-typography";
import { cn } from "@/lib/cn";

export function MobileAppPromo() {
  return (
    <GlassPanel
      variant="strong"
      intensity="medium"
      elevation="floating"
      className="rounded-2xl p-5"
    >
      <h3 className={cn(glassText.primary, "text-lg font-semibold leading-snug tracking-[-0.03em]")}>
        Get the Mobile App now
      </h3>
      <p className={cn(glassText.muted, "mt-2 text-xs leading-relaxed")}>
        Manage your business whenever you want with your thumbs
      </p>
      <SolidButton fullWidth className="mt-5">
        Download Now
      </SolidButton>
    </GlassPanel>
  );
}
