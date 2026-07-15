import { DashboardRightSidebar } from "@/components/dashboard/right-sidebar/DashboardRightSidebar";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

/**
 * Right sidebar fixo do app — glass shell com agenda e perfil.
 * Hidden on mobile via DesktopAppShell (`lg:flex` only).
 */
export function DashboardRightSidebarPanel() {
  return (
    <GlassPanel
      variant="hero"
      intensity="high"
      elevation="base"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px] shadow-2xl shadow-orange-950/20"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DashboardRightSidebar />
      </div>
    </GlassPanel>
  );
}
