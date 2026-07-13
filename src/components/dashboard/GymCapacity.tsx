"use client";

import { ArrowUpRight } from "lucide-react";
import { IconButton } from "@/components/common/form";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { GymCapacitySkeleton } from "@/components/dashboard/GymCapacitySkeleton";
import type { GymCapacityViewData } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/cn";

export { GymCapacitySkeleton as GymCapacityLoading } from "@/components/dashboard/GymCapacitySkeleton";

const ROWS = 10;
const COLS = 14;

type GymCapacityProps = {
  data: GymCapacityViewData;
  isLoading?: boolean;
};

export function GymCapacity({ data, isLoading = false }: GymCapacityProps) {
  if (isLoading) {
    return <GymCapacitySkeleton />;
  }

  const activeDotKeys = new Set(data.dots.filter((dot) => dot.isActive).map((dot) => dot.key));

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className="h-full rounded-2xl p-5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className={glassTextStyles.panelTitle}>Gym Capacity</p>
          <p className={cn(glassTextStyles.kpiLabel, "mt-1")}>
            {data.used} de {data.total} vagas (últimas 2h)
          </p>
        </div>
        <IconButton
          aria-label="Ver detalhes da capacidade"
          className="bg-white/7 hover:bg-white/13 hover:text-glass-primary"
        >
          <ArrowUpRight className="size-3.5" />
        </IconButton>
      </div>

      <div
        className="h-full grid gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          const key = `${row}-${col}`;
          const isActive = activeDotKeys.has(key);

          return (
            <div
              key={key}
              className={cn(
                "size-1.5 rounded-full",
                isActive ? "bg-orange-500" : "bg-white/70",
              )}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={glassText.secondary}>Space Status</span>
        <span className={cn(glassText.primary, "font-semibold")}>{data.occupancyPercent}%</span>
      </div>
    </GlassPanel>
  );
}
