import type { ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";

type CenterPanelShellProps = {
  children: ReactNode;
};

export function CenterPanelShell({ children }: CenterPanelShellProps) {
  return (
    <div className="h-[calc(100dvh-152px)] w-full overflow-hidden rounded-[2rem] lg:h-[clamp(600px,85vh,880px)] lg:w-[clamp(500px,52vw,1000px)] lg:rounded-[34px]">
      <GlassPanel
        variant="hero"
        intensity="high"
        elevation="base"
        className="h-full w-full rounded-[inherit] p-5 sm:p-6"
      >
        <div
          className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ containerType: "size" }}
        >
          {children}
        </div>
      </GlassPanel>
    </div>
  );
}
