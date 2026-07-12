import type { ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

type CenterPanelShellProps = {
  children: ReactNode;
};

export function CenterPanelShell({ children }: CenterPanelShellProps) {
  return (
    <GlassPanel
      variant="hero"
      intensity="high"
      className="h-[calc(100dvh-152px)] w-full rounded-[2rem] p-5  sm:p-6 lg:h-[clamp(600px,85vh,880px)] lg:w-[clamp(500px,52vw,1000px)] lg:rounded-[34px]"
    >
      <div className="flex h-full min-h-0 flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </GlassPanel>
  );
}
