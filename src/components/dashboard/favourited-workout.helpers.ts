import {
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  type LucideIcon,
  Music2,
  Zap,
} from "lucide-react";
import type {
  FavouritedWorkoutItem,
  WorkoutCategory,
} from "@/components/dashboard/favourited-workout.types";

export const WORKOUT_PILL_POSITIONS = [
  "top-[8%] left-[5%]",
  "top-[6%] left-[36%]",
  "top-[10%] right-[5%]",
  "top-[30%] left-[2%]",
  "top-[28%] left-[34%]",
  "top-[26%] right-[6%]",
  "bottom-[30%] left-[7%]",
  "bottom-[28%] right-[28%]",
  "bottom-[10%] left-[24%]",
  "bottom-[8%] right-[4%]",
  "top-[18%] left-[18%]",
  "top-[20%] right-[20%]",
] as const;

export const WORKOUT_SCATTER_MAX = WORKOUT_PILL_POSITIONS.length;

export function resolveWorkoutPillPosition(index: number): string {
  return WORKOUT_PILL_POSITIONS[index] ?? WORKOUT_PILL_POSITIONS[WORKOUT_PILL_POSITIONS.length - 1];
}

export function sortWorkoutsForDisplay(
  workouts: FavouritedWorkoutItem[],
): FavouritedWorkoutItem[] {
  return [...workouts].sort((left, right) => {
    if (left.highlighted !== right.highlighted) {
      return left.highlighted ? -1 : 1;
    }

    if (right.checkInCount !== left.checkInCount) {
      return right.checkInCount - left.checkInCount;
    }

    return left.name.localeCompare(right.name, "pt-BR");
  });
}

const CATEGORY_ICONS: Record<WorkoutCategory, LucideIcon> = {
  funcional: Dumbbell,
  cardio: Bike,
  mente_corpo: Heart,
};

const NAME_ICON_OVERRIDES: Record<string, LucideIcon> = {
  crossfit: Zap,
  trx: Flame,
  yoga: Heart,
  pilates: Heart,
  spinning: Bike,
  jump: Footprints,
  dança: Music2,
  danca: Music2,
  musculação: Dumbbell,
  musculacao: Dumbbell,
};

export function resolveWorkoutIcon(name: string, category: WorkoutCategory): LucideIcon {
  const normalized = name.trim().toLowerCase();
  return NAME_ICON_OVERRIDES[normalized] ?? CATEGORY_ICONS[category] ?? Dumbbell;
}

export function computeTopHighlightedIds(
  workouts: Pick<FavouritedWorkoutItem, "id" | "checkInCount">[],
  limit = 3,
): Set<string> {
  const ranked = [...workouts]
    .filter((workout) => workout.checkInCount > 0)
    .sort((left, right) => right.checkInCount - left.checkInCount)
    .slice(0, limit);

  return new Set(ranked.map((workout) => workout.id));
}

export function filterWorkoutsByCategory(
  workouts: FavouritedWorkoutItem[],
  category: WorkoutCategory | "all",
): FavouritedWorkoutItem[] {
  if (category === "all") return workouts;
  return workouts.filter((workout) => workout.category === category);
}
