import { computeTopHighlightedIds } from "@/components/dashboard/favourited-workout.helpers";
import type {
  FavouritedWorkoutsData,
  WorkoutCategory,
} from "@/components/dashboard/favourited-workout.types";
import {
  DEFAULT_WORKOUT_CATEGORY,
  isWorkoutCategory,
  resolveWorkoutCategoryForClassName,
  WORKOUT_CATEGORY_IDS,
} from "@/config/workout-categories";
import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ClassRow = {
  id: string;
  name: string;
  category: string | null;
};

type CheckInRow = {
  class_id: string | null;
};

function resolveCategory(row: ClassRow): WorkoutCategory {
  if (isWorkoutCategory(row.category)) return row.category;
  return resolveWorkoutCategoryForClassName(row.name);
}

function dedupeWorkoutsByName(
  workouts: Array<{
    id: string;
    name: string;
    category: WorkoutCategory;
    checkInCount: number;
  }>,
) {
  const byName = new Map<string, (typeof workouts)[number]>();

  for (const workout of workouts) {
    const key = workout.name.trim().toLowerCase();
    const existing = byName.get(key);

    if (!existing || workout.checkInCount > existing.checkInCount) {
      byName.set(key, workout);
    }
  }

  return Array.from(byName.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "pt-BR"),
  );
}

export async function getFavouritedWorkoutsData(
  supabase: SupabaseClient,
): Promise<FavouritedWorkoutsData> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: classRows, error: classesError } = await supabase
    .from("classes")
    .select("id, name, category")
    .order("name");

  if (classesError) throw classesError;

  const { data: checkInRows, error: checkInsError } = await supabase
    .from("check_ins")
    .select("class_id")
    .gte("checked_at", since.toISOString())
    .not("class_id", "is", null);

  if (checkInsError) throw checkInsError;

  const checkInCountByClass = new Map<string, number>();

  for (const row of (checkInRows ?? []) as CheckInRow[]) {
    if (!row.class_id) continue;
    checkInCountByClass.set(
      row.class_id,
      (checkInCountByClass.get(row.class_id) ?? 0) + 1,
    );
  }

  const workouts = dedupeWorkoutsByName(
    ((classRows ?? []) as ClassRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      category: resolveCategory(row),
      checkInCount: checkInCountByClass.get(row.id) ?? 0,
    })),
  );

  const highlightedIds = computeTopHighlightedIds(workouts, 3);

  const categoriesInData = new Set(workouts.map((workout) => workout.category));
  const categories = WORKOUT_CATEGORY_IDS.filter((category) => categoriesInData.has(category));

  return {
    workouts: workouts.map((workout) => ({
      ...workout,
      highlighted: highlightedIds.has(workout.id),
    })),
    categories: categories.length > 0 ? categories : [...WORKOUT_CATEGORY_IDS],
  };
}

export { DEFAULT_WORKOUT_CATEGORY };
