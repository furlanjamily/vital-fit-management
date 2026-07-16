import type { ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

type MobilePageWrapperProps = {
  children: ReactNode;
};

export function MobilePageWrapper({ children }: MobilePageWrapperProps) {
  return (
    <main className="relative flex h-full max-h-full flex-col overflow-hidden text-white lg:hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[var(--mobile-content-top-gap)]">
        <div className="flex min-h-0 flex-1 px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))]">
          <GlassPanel
            variant="hero"
            intensity="high"
            className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[2rem] p-5 shadow-[0_34px_120px_rgba(42,28,17,0.34)] sm:p-6"
          >
            <div
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ containerType: "size" }}
            >
              {children}
            </div>
          </GlassPanel>
        </div>
      </div>
    </main>
  );
}
