import { GlassPanel } from "@/components/common/glass-panel/glass-panel";

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
      <button
        type="button"
        className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1a1d19] transition hover:bg-white/92"
      >
        Download Now
      </button>
    </GlassPanel>
  );
}
