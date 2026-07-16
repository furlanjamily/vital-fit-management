"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GhostButton } from "@/components/common/form";
import { InlineAlert } from "@/components/common/feedback/InlineAlert";
import { GlassPanel } from "@/components/common/glass-panel/GlassPanel";
import {
  filterWorkoutsByCategory,
  resolveWorkoutIcon,
  resolveWorkoutPillPosition,
  sortWorkoutsForDisplay,
  WORKOUT_SCATTER_MAX,
} from "@/components/dashboard/favourited-workout.helpers";
import {
  WORKOUT_CATEGORY_TABS,
  type FavouritedWorkoutsData,
  type WorkoutCategoryFilter,
} from "@/components/dashboard/favourited-workout.types";
import { glassText, glassTextStyles } from "@/config/glass-typography";
import { motionTokens } from "@/lib/motion";
import { cn } from "@/lib/cn";

type FavouritedWorkoutProps = {
  data: FavouritedWorkoutsData;
  error?: string | null;
};

export function FavouritedWorkout({
  data,
  error = null,
}: FavouritedWorkoutProps) {
  const [activeTab, setActiveTab] = useState<WorkoutCategoryFilter>("all");

  const filteredWorkouts = useMemo(
    () => sortWorkoutsForDisplay(filterWorkoutsByCategory(data.workouts, activeTab)),
    [activeTab, data.workouts],
  );

  const useScatterLayout = filteredWorkouts.length <= WORKOUT_SCATTER_MAX;

  return (
    <GlassPanel
      variant="subtle"
      intensity="low"
      elevation="floating"
      className="rounded-2xl p-5 shadow-none after:shadow-none"
    >
      <p className={cn(glassTextStyles.panelTitle, "mb-4")}>Treinos favoritos</p>

      {error ? (
        <InlineAlert className="mb-4">{error}</InlineAlert>
      ) : null}

      <div className="mb-4 flex gap-4 overflow-x-auto border-b border-white/10 pb-3 text-[11px]">
        {WORKOUT_CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <GhostButton
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-none pb-1 text-[11px]",
                isActive
                  ? "border-b border-orange-500 pb-1 font-semibold text-orange-500 hover:bg-transparent"
                  : cn(
                      glassText.muted,
                      "hover:bg-transparent hover:text-glass-secondary",
                    ),
              )}
            >
              {tab.label}
            </GhostButton>
          );
        })}
      </div>

      <div className="relative h-[180px] overflow-hidden rounded-xl bg-white/8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: motionTokens.duration.fast,
              ease: motionTokens.easing,
            }}
            className="absolute inset-0"
          >
            {filteredWorkouts.length === 0 ? (
              <p
                className={cn(
                  "absolute inset-0 flex items-center justify-center px-4 text-center text-[11px]",
                  glassText.muted,
                )}
              >
                Nenhum treino nesta categoria nos últimos 30 dias.
              </p>
            ) : useScatterLayout ? (
              filteredWorkouts.map((workout, index) => {
                const Icon = resolveWorkoutIcon(workout.name, workout.category);

                return (
                  <span
                    key={workout.id}
                    className={cn(
                      "absolute inline-flex max-w-[calc(100%-12px)] items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold",
                      workout.highlighted
                        ? "bg-[#FF9A4A] text-white shadow-[0_8px_20px_rgba(255,154,74,0.35)]"
                        : cn("border border-white/14 bg-white/8", glassText.secondary),
                      resolveWorkoutPillPosition(index),
                    )}
                  >
                    <Icon className="size-3 shrink-0" />
                    <span className="truncate">{workout.name}</span>
                  </span>
                );
              })
            ) : (
              <div className="flex h-full flex-wrap content-center justify-center gap-2 p-3">
                {filteredWorkouts.map((workout) => {
                  const Icon = resolveWorkoutIcon(workout.name, workout.category);

                  return (
                    <span
                      key={workout.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold",
                        workout.highlighted
                          ? "bg-[#FF9A4A] text-white shadow-[0_8px_20px_rgba(255,154,74,0.35)]"
                          : cn("border border-white/14 bg-white/8", glassText.secondary),
                      )}
                    >
                      <Icon className="size-3 shrink-0" />
                      {workout.name}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}

export { FavouritedWorkoutSkeleton as FavouritedWorkoutLoading } from "@/components/dashboard/FavouritedWorkoutSkeleton";
