import { DashboardRightSidebar } from "@/components/dashboard/right-sidebar/DashboardRightSidebar";

/**
 * Right sidebar fixo do app — glass shell com agenda e perfil.
 * Hidden on mobile via DesktopAppShell (`lg:flex` only).
 */
export function DashboardRightSidebarPanel() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.07] shadow-2xl shadow-orange-950/20 backdrop-blur-[12px]">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DashboardRightSidebar />
      </div>
    </div>
  );
}
