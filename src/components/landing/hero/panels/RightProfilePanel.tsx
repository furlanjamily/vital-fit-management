import { ProfileContent } from "@/components/profile/ProfileContent";

/**
 * Flat glass plate: no extrusion, no side shadows.
 * Outer div = fixed glass shell. Inner div = hidden vertical scroll.
 */
export function RightProfilePanel() {
  return (
    <div className="h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] shadow-2xl shadow-orange-950/20 backdrop-blur-[12px]">
      <div className="flex h-full flex-col overflow-y-auto p-5 pb-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ProfileContent />
      </div>
    </div>
  );
}
