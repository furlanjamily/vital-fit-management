import { Flame } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { cn } from "@/lib/cn";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const barHeights = [52, 68, 74, 88, 62, 70, 58, 64];
const highlightedIndex = 3;

export function RevenueAnalytics() {
  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className="rounded-2xl p-5"
    >
      <p className="mb-5 text-sm font-semibold text-white">Revenue Analytics</p>

      <div className="relative flex h-[200px] items-end gap-2.5 px-1 pb-6">
        {barHeights.map((height, index) => {
          const isHighlighted = index === highlightedIndex;

          return (
            <div
              key={months[index]}
              className="relative flex h-full flex-1 flex-col items-center justify-end"
            >
              {isHighlighted && (
                <GlassPanel
                  elevation="modal"
                  intensity="medium"
                  variant="strong"
                  className="absolute -top-1 left-1/2  z-20 w-[116px] -translate-x-1/2 rounded-xl bg-[#221d17]/90 px-3 py-2.5"
                >
                  <p className="text-[10px] font-semibold text-white">April 2024</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-white/75">
                    <span className="size-1.5 rounded-full bg-white" />
                    Revenue $564
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/55">
                    <span className="size-1.5 rounded-full bg-white/40" />
                    Expense -$188
                  </div>
                </GlassPanel>
              )}

              <div
                className="relative w-full max-w-7"
                style={{ height: `${height}%` }}
              >
                {isHighlighted && (
                  <Flame className="absolute -top-5 left-1/2 z-10 size-4 -translate-x-1/2 fill-amber-400 text-amber-400" />
                )}
                <div
                  className={cn(
                    "h-full w-full rounded-t-lg rounded-b-sm",
                    isHighlighted
                      ? "bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.85)_0px,rgba(255,255,255,0.85)_3px,rgba(255,255,255,0.35)_3px,rgba(255,255,255,0.35)_6px)] shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      : "bg-white/18",
                  )}
                />
              </div>
              <span className="mt-2 text-[10px] font-medium text-white/35">
                {months[index]}
              </span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
