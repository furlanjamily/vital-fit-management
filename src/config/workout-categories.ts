import { CLASS_SCHEDULE_NAMES } from "@/components/settings/classes/schedule.types";
import { PROFESSIONAL_SPECIALTIES } from "@/config/professional-specialties";

/** Categorias de treino usadas no painel e na coluna `classes.category`. */
export const WORKOUT_CATEGORY_IDS = ["funcional", "cardio", "mente_corpo"] as const;

export type WorkoutCategory = (typeof WORKOUT_CATEGORY_IDS)[number];

export type WorkoutCategoryFilter = "all" | WorkoutCategory;

export const WORKOUT_CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  funcional: "Funcional",
  cardio: "Cardio",
  mente_corpo: "Mente & corpo",
};

export const WORKOUT_CATEGORY_TABS: ReadonlyArray<{
  id: WorkoutCategoryFilter;
  label: string;
}> = [
  { id: "all", label: "Todos os treinos" },
  ...WORKOUT_CATEGORY_IDS.map((id) => ({
    id,
    label: WORKOUT_CATEGORY_LABELS[id],
  })),
];

/** Modalidades cadastradas no sistema → categoria do painel. */
export const CLASS_NAME_TO_WORKOUT_CATEGORY: Record<string, WorkoutCategory> = {
  Crossfit: "funcional",
  TRX: "funcional",
  Musculação: "funcional",
  Spinning: "cardio",
  Jump: "cardio",
  Yoga: "mente_corpo",
  Pilates: "mente_corpo",
  Dança: "mente_corpo",
};

export const DEFAULT_WORKOUT_CATEGORY: WorkoutCategory = "funcional";

/** Todas as modalidades conhecidas pelo sistema (grade + especialidades). */
export const SYSTEM_CLASS_NAMES = Array.from(
  new Set([...CLASS_SCHEDULE_NAMES, ...PROFESSIONAL_SPECIALTIES]),
).sort((left, right) => left.localeCompare(right, "pt-BR"));

export function isWorkoutCategory(value: string | null | undefined): value is WorkoutCategory {
  return WORKOUT_CATEGORY_IDS.includes(value as WorkoutCategory);
}

export function resolveWorkoutCategoryForClassName(
  className: string | null | undefined,
): WorkoutCategory {
  if (!className?.trim()) return DEFAULT_WORKOUT_CATEGORY;
  return CLASS_NAME_TO_WORKOUT_CATEGORY[className.trim()] ?? DEFAULT_WORKOUT_CATEGORY;
}

export function getWorkoutCategoryLabel(category: WorkoutCategory): string {
  return WORKOUT_CATEGORY_LABELS[category];
}
