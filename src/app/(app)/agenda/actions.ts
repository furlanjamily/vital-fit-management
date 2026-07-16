"use server";

import type { User } from "@supabase/supabase-js";
import {
  buildEventTimestamps,
  mapEventRow,
} from "@/components/agenda/agenda.helpers";
import { createEventSchema, type CreateEventInput } from "@/components/agenda/event.schema";
import {
  isEventType,
  type AgendaEvent,
  type AgendaUserOption,
  type EventType,
} from "@/components/agenda/agenda.types";
import {
  actionFailure,
  actionSuccess,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from "@/lib/auth/resolve-user-display";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/is-uuid";

const EVENTS_TABLE = "events";
const PARTICIPANTS_TABLE = "event_participants";
const AGENDA_PATH = "/agenda";
const BRAZIL_TZ_OFFSET = "-03:00";

/** Limites de dia/mês em America/Sao_Paulo (UTC-3, sem DST). */
function getBrazilCalendarBounds(now = new Date()) {
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [year, month] = dateStr.split("-").map(Number);
  const todayStart = new Date(`${dateStr}T00:00:00${BRAZIL_TZ_OFFSET}`).toISOString();
  const todayEnd = new Date(`${dateStr}T23:59:59.999${BRAZIL_TZ_OFFSET}`).toISOString();

  const monthStart = new Date(
    `${year}-${String(month).padStart(2, "0")}-01T00:00:00${BRAZIL_TZ_OFFSET}`,
  ).toISOString();
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999${BRAZIL_TZ_OFFSET}`,
  ).toISOString();

  return { todayStart, todayEnd, monthStart, monthEnd };
}

const SESSION_EXPIRED_MESSAGE = "Sessão expirada. Faça login novamente.";
const MISSING_TABLE_MESSAGE =
  "Tabelas da agenda não existem. Execute supabase/collaborative-agenda.sql no SQL Editor.";
const MISSING_SERVICE_ROLE_MESSAGE =
  "Configure SUPABASE_SERVICE_ROLE_KEY no .env para listar usuários.";

const EVENTS_SELECT = `
  id,
  title,
  description,
  start_time,
  end_time,
  type,
  meeting_link,
  location,
  created_by,
  created_at,
  event_participants ( user_id )
` as const;

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type AuthenticatedSession =
  | { authenticated: true; supabase: ServerSupabaseClient; userId: string }
  | { authenticated: false; error: string };

function mapAuthUserToOption(user: User): AgendaUserOption {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    name: resolveDisplayName(metadata, user.email ?? undefined),
    avatarUrl: resolveAvatarUrl(metadata),
  };
}

function isActiveUser(user: User): boolean {
  if (typeof user.user_metadata?.status === "string") {
    return user.user_metadata.status !== "inactive";
  }

  if (user.banned_until && new Date(user.banned_until) > new Date()) {
    return false;
  }

  return true;
}

async function requireAuthenticatedClient(): Promise<AuthenticatedSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authenticated: false, error: SESSION_EXPIRED_MESSAGE };

  return { authenticated: true, supabase, userId: user.id };
}

function mapDatabaseError(message: string): string {
  if (message.includes("events") && message.includes("does not exist")) {
    return MISSING_TABLE_MESSAGE;
  }

  if (message.includes("event_participants") && message.includes("does not exist")) {
    return MISSING_TABLE_MESSAGE;
  }

  return message;
}

async function fetchUserOptions(): Promise<ActionResult<AgendaUserOption[]>> {
  const admin = createAdminClient();
  if (!admin) return actionFailure(MISSING_SERVICE_ROLE_MESSAGE);

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 100 });
  if (error) return actionFailure(error.message);

  const users = (data.users ?? [])
    .filter(isActiveUser)
    .map(mapAuthUserToOption)
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));

  return actionSuccess(users);
}

export async function getAgendaUserOptionsAction(): Promise<ActionResult<AgendaUserOption[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    return fetchUserOptions();
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao listar usuários."));
  }
}

export async function listAgendaEventsAction(
  rangeStart: string,
  rangeEnd: string,
): Promise<ActionResult<AgendaEvent[]>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const [eventsResult, usersResult] = await Promise.all([
      session.supabase
        .from(EVENTS_TABLE)
        .select(EVENTS_SELECT)
        .gte("start_time", rangeStart)
        .lte("start_time", rangeEnd)
        .order("start_time", { ascending: true }),
      fetchUserOptions(),
    ]);

    if (eventsResult.error) {
      return actionFailure(mapDatabaseError(eventsResult.error.message));
    }

    if (!usersResult.success) {
      return actionFailure(usersResult.error);
    }

    const userLookup = new Map(usersResult.data.map((user) => [user.id, user]));

    const events = (eventsResult.data ?? []).map((row) => mapEventRow(row, userLookup));
    return actionSuccess(events);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao carregar eventos."));
  }
}

export async function createAgendaEventAction(
  input: CreateEventInput,
): Promise<ActionResult<AgendaEvent>> {
  try {
    const parsed = createEventSchema.safeParse(input);
    if (!parsed.success) return actionFailure(parsed.error.issues[0].message);

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { title, description, date, startTime, endTime, type, meetingLink, location, participantIds } =
      parsed.data;

    const timestamps = buildEventTimestamps(date, startTime, endTime);
    const uniqueParticipantIds = Array.from(
      new Set([session.userId, ...participantIds]),
    );
    const eventId = crypto.randomUUID();

    const { error: insertError } = await session.supabase.from(EVENTS_TABLE).insert({
      id: eventId,
      title,
      description: description?.trim() || null,
      start_time: timestamps.startTime,
      end_time: timestamps.endTime,
      type,
      meeting_link: type === "reuniao" ? meetingLink?.trim() || null : null,
      location: location?.trim() || null,
      created_by: session.userId,
    });

    if (insertError) {
      return actionFailure(mapDatabaseError(insertError.message));
    }

    const participantRows = uniqueParticipantIds.map((userId) => ({
      event_id: eventId,
      user_id: userId,
    }));

    const { error: participantsError } = await session.supabase
      .from(PARTICIPANTS_TABLE)
      .insert(participantRows);

    if (participantsError) {
      await session.supabase.from(EVENTS_TABLE).delete().eq("id", eventId);
      return actionFailure(mapDatabaseError(participantsError.message));
    }

    const usersResult = await fetchUserOptions();
    if (!usersResult.success) return actionFailure(usersResult.error);

    const userLookup = new Map(usersResult.data.map((user) => [user.id, user]));

    const { data: fullEvent, error: fetchError } = await session.supabase
      .from(EVENTS_TABLE)
      .select(EVENTS_SELECT)
      .eq("id", eventId)
      .single();

    if (fetchError || !fullEvent) {
      return actionFailure(mapDatabaseError(fetchError?.message ?? "Evento criado, mas não foi possível recarregá-lo."));
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(AGENDA_PATH);

    return actionSuccess(mapEventRow(fullEvent, userLookup));
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao criar evento."));
  }
}

const INVALID_EVENT_ID_MESSAGE = "ID de evento inválido.";

export async function deleteAgendaEventAction(eventId: string): Promise<ActionResult<null>> {
  try {
    if (!isUuid(eventId)) {
      return actionFailure(INVALID_EVENT_ID_MESSAGE);
    }

    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const { error } = await session.supabase.from(EVENTS_TABLE).delete().eq("id", eventId);

    if (error) {
      return actionFailure(mapDatabaseError(error.message));
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(AGENDA_PATH);

    return actionSuccess(null);
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao excluir evento."));
  }
}

export type AgendaSidebarData = {
  upNext: AgendaEvent | null;
  upcomingTodayCount: number;
  categoryCounts: Record<EventType, number>;
};

export async function getAgendaSidebarDataAction(
  _cacheBust?: number,
): Promise<ActionResult<AgendaSidebarData>> {
  try {
    const session = await requireAuthenticatedClient();
    if (!session.authenticated) return actionFailure(session.error);

    const nowIso = new Date().toISOString();
    const { todayStart, todayEnd, monthStart, monthEnd } = getBrazilCalendarBounds();

    const [upNextResult, todayResult, monthResult, usersResult] = await Promise.all([
      session.supabase
        .from(EVENTS_TABLE)
        .select(EVENTS_SELECT)
        .gt("start_time", nowIso)
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle(),
      session.supabase
        .from(EVENTS_TABLE)
        .select("id", { count: "exact", head: true })
        .gte("start_time", todayStart)
        .lte("start_time", todayEnd),
      session.supabase
        .from(EVENTS_TABLE)
        .select("type")
        .gte("start_time", monthStart)
        .lte("start_time", monthEnd),
      fetchUserOptions(),
    ]);

    if (upNextResult.error) return actionFailure(mapDatabaseError(upNextResult.error.message));
    if (todayResult.error) return actionFailure(mapDatabaseError(todayResult.error.message));
    if (monthResult.error) return actionFailure(mapDatabaseError(monthResult.error.message));
    if (!usersResult.success) return actionFailure(usersResult.error);

    const userLookup = new Map(usersResult.data.map((user) => [user.id, user]));

    const categoryCounts: Record<EventType, number> = {
      reuniao: 0,
      tarefa: 0,
      compromisso: 0,
    };

    for (const row of monthResult.data ?? []) {
      if (isEventType(row.type)) {
        categoryCounts[row.type] += 1;
      }
    }

    const upNext = upNextResult.data
      ? mapEventRow(upNextResult.data, userLookup)
      : null;

    return actionSuccess({
      upNext,
      upcomingTodayCount: todayResult.count ?? 0,
      categoryCounts,
    });
  } catch (error) {
    return actionFailure(toActionError(error, "Erro ao carregar dados da agenda."));
  }
}
