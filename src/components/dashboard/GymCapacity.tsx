import { ArrowUpRight } from "lucide-react";
import { IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/glass-panel";
import { cn } from "@/lib/cn";

const ROWS = 10;
const COLS = 14;

const activeDots = new Set([
  "0-2", "0-5", "0-9", "0-12",
  "1-1", "1-4", "1-7", "1-10",
  "2-0", "2-3", "2-6", "2-8", "2-11", "2-13",
  "3-2", "3-5", "3-9", "3-12",
  "4-1", "4-4", "4-7", "4-10",
  "5-0", "5-3", "5-6", "5-8", "5-11",
  "6-2", "6-5", "6-9", "6-12",
  "7-1", "7-4", "7-7", "7-10", "7-13",
  "8-0", "8-3", "8-6", "8-8", "8-11",
  "9-2", "9-5", "9-9", "9-12",
]);

export function GymCapacity() {
  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className="rounded-2xl p-5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Gym Capacity</p>
          <p className="mt-1 text-[11px] text-white/40">Indoor and outdoor</p>
        </div>
        <IconButton
          aria-label="Ver detalhes da capacidade"
          className="bg-white/7 text-white/70 hover:bg-white/13 hover:text-white"
        >
          <ArrowUpRight className="size-3.5" />
        </IconButton>
      </div>

      <div
        className="grid gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          const key = `${row}-${col}`;
          const isActive = activeDots.has(key);

          return (
            <div
              key={key}
              className={cn(
                "size-1.5 rounded-full",
                isActive ? "bg-white" : "bg-white/20",
              )}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-white/50">Space Status</span>
        <span className="font-semibold text-white">56%</span>
      </div>
    </GlassPanel>
  );
}
