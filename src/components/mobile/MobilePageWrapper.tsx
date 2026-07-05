import type { ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { HeroBackground } from "@/components/landing/hero/HeroBackground";

type MobilePageWrapperProps = {
  children: ReactNode;
};

export function MobilePageWrapper({ children }: MobilePageWrapperProps) {
  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#17120d] text-white lg:hidden">
      <HeroBackground />

      <div className="flex h-dvh w-full items-start justify-center overflow-hidden pt-6">
        <div className="flex w-full items-start justify-center px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))]">
          <GlassPanel
            variant="hero"
            intensity="high"
            className="h-[calc(100dvh-152px)] w-full rounded-[2rem] p-5 shadow-[0_34px_120px_rgba(42,28,17,0.34)] sm:p-6"
          >
            <div className="flex h-full min-h-0 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </div>
          </GlassPanel>
        </div>
      </div>
    </main>
  );
}
