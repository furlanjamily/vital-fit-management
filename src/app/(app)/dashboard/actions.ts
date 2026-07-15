"use server";

import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import { createClient } from "@/lib/supabase/server";
import type { FavouritedWorkoutsData } from "@/components/dashboard/favourited-workout.types";
import { getFavouritedWorkoutsData } from "@/services/favourited-workouts";

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const MISSING_WORKOUTS_SCHEMA_MESSAGE =
  "Schema de treinos incompleto. Execute supabase/classes-workout-categories.sql no Supabase.";

type AuthenticatedSession =
  | { authenticated: true; supabase: Awaited<ReturnType<typeof createClient>> }
  | { authenticated: false; error: string };

async function requireAuthenticatedClient(): Promise<AuthenticatedSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false, error: SESSION_EXPIRED_MESSAGE };

  return { authenticated: true, supabase };
}

function isSchemaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("could not find") ||
    lower.includes("column") ||
    lower.includes("category") ||
    lower.includes("class_id")
  );
}

export async function getFavouritedWorkoutsAction(): Promise<
  ActionResult<FavouritedWorkoutsData>
> {
  const session = await requireAuthenticatedClient();
  if (!session.authenticated) return actionFailure(session.error);

  try {
    const data = await getFavouritedWorkoutsData(session.supabase);
    return actionSuccess(data);
  } catch (error) {
    const message = toActionError(error, "Não foi possível carregar os treinos favoritos.");

    if (isSchemaError(message)) {
      return actionFailure(MISSING_WORKOUTS_SCHEMA_MESSAGE);
    }

    return actionFailure(message);
  }
}
