-- VitalFit Management — agenda colaborativa (events + event_participants)
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS configurar auth (usuários do sistema via Admin API).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  type text not null
    check (type in ('reuniao', 'tarefa', 'compromisso')),
  meeting_link text,
  location text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint events_end_after_start check (end_time > start_time)
);

create table if not exists public.event_participants (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists events_start_time_idx
  on public.events (start_time);

create index if not exists events_created_by_idx
  on public.events (created_by);

create index if not exists event_participants_user_idx
  on public.event_participants (user_id);

comment on table public.events is 'Eventos da agenda colaborativa (reuniões, tarefas, compromissos)';
comment on table public.event_participants is 'Participantes convidados por evento — controle de visibilidade via RLS';
comment on column public.events.type is 'reuniao | tarefa | compromisso';
comment on column public.events.meeting_link is 'Link de videoconferência (opcional, usado quando type = reuniao)';

-- ---------------------------------------------------------------------------
-- Helpers RLS (SECURITY DEFINER evita recursão entre events ↔ event_participants)
-- ---------------------------------------------------------------------------

create or replace function public.is_agenda_event_participant(
  p_event_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_participants ep
    where ep.event_id = p_event_id
      and ep.user_id = p_user_id
  );
$$;

create or replace function public.is_agenda_event_creator(
  p_event_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = p_event_id
      and e.created_by = p_user_id
  );
$$;

grant execute on function public.is_agenda_event_participant(uuid, uuid) to authenticated, service_role;
grant execute on function public.is_agenda_event_creator(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Permissões e RLS
-- ---------------------------------------------------------------------------

grant all on table public.events to authenticated, service_role;
grant all on table public.event_participants to authenticated, service_role;

alter table public.events enable row level security;
alter table public.event_participants enable row level security;

-- events: SELECT — participantes ou criador (criador precisa ler antes de inserir convites)
drop policy if exists "events_select_participant" on public.events;
drop policy if exists "events_insert_authenticated" on public.events;
drop policy if exists "events_update_participant" on public.events;
drop policy if exists "events_delete_participant" on public.events;

create policy "events_select_participant"
  on public.events for select to authenticated
  using (
    public.is_agenda_event_participant(id, auth.uid())
    or created_by = auth.uid()
  );

create policy "events_insert_authenticated"
  on public.events for insert to authenticated
  with check (created_by = auth.uid());

create policy "events_update_participant"
  on public.events for update to authenticated
  using (
    public.is_agenda_event_participant(id, auth.uid())
    or created_by = auth.uid()
  )
  with check (
    public.is_agenda_event_participant(id, auth.uid())
    or created_by = auth.uid()
  );

create policy "events_delete_participant"
  on public.events for delete to authenticated
  using (
    public.is_agenda_event_participant(id, auth.uid())
    or created_by = auth.uid()
  );

-- event_participants: SELECT — participantes do mesmo evento
drop policy if exists "event_participants_select_same_event" on public.event_participants;
drop policy if exists "event_participants_insert_creator" on public.event_participants;
drop policy if exists "event_participants_delete_creator" on public.event_participants;

create policy "event_participants_select_same_event"
  on public.event_participants for select to authenticated
  using (
    public.is_agenda_event_participant(event_id, auth.uid())
    or public.is_agenda_event_creator(event_id, auth.uid())
  );

create policy "event_participants_insert_creator"
  on public.event_participants for insert to authenticated
  with check (
    public.is_agenda_event_creator(event_id, auth.uid())
    or user_id = auth.uid()
  );

create policy "event_participants_delete_creator"
  on public.event_participants for delete to authenticated
  using (public.is_agenda_event_creator(event_id, auth.uid()));

notify pgrst, 'reload schema';
