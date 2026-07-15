import type { WorkoutCategory } from "@/config/workout-categories";

export type { WorkoutCategory };

export type WorkoutCategoryFilter = "all" | WorkoutCategory;

export type FavouritedWorkoutItem = {
  id: string;
  name: string;
  category: WorkoutCategory;
  checkInCount: number;
  highlighted: boolean;
};

export type FavouritedWorkoutsData = {
  workouts: FavouritedWorkoutItem[];
  categories: WorkoutCategory[];
};

export { WORKOUT_CATEGORY_TABS } from "@/config/workout-categories";
