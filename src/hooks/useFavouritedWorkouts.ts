"use client";

import { useEffect, useState } from "react";
import { getFavouritedWorkoutsAction } from "@/app/(app)/dashboard/actions";
import type { FavouritedWorkoutsData } from "@/components/dashboard/favourited-workout.types";

const EMPTY_FAVOURITED_WORKOUTS: FavouritedWorkoutsData = {
  workouts: [],
  categories: [],
};

export function useFavouritedWorkouts() {
  const [data, setData] = useState<FavouritedWorkoutsData>(EMPTY_FAVOURITED_WORKOUTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getFavouritedWorkoutsAction().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setData(EMPTY_FAVOURITED_WORKOUTS);
        setError(result.error);
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
