import {
  getAgendaUserOptionsAction,
  listAgendaEventsAction,
} from "@/app/(app)/agenda/actions";
import { AgendaContentClient } from "@/components/agenda/AgendaContentClient";
import { computeDateRange } from "@/components/classes/class-schedule.helpers";

export async function AgendaContent() {
  const referenceDate = new Date();
  const { start, end } = computeDateRange(referenceDate, "week");

  const [eventsResult, usersResult] = await Promise.all([
    listAgendaEventsAction(start.toISOString(), end.toISOString()),
    getAgendaUserOptionsAction(),
  ]);

  const events = eventsResult.success ? eventsResult.data : [];
  const userOptions = usersResult.success ? usersResult.data : [];

  const loadError = !eventsResult.success
    ? eventsResult.error
    : !usersResult.success
      ? usersResult.error
      : null;

  return (
    <AgendaContentClient
      initialEvents={events}
      userOptions={userOptions}
      loadError={loadError}
    />
  );
}
