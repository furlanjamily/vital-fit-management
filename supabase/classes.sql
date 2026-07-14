-- VitalFit Management — aulas, grade horária e agendamentos
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/members.sql e supabase/professionals.sql

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint classes_name_unique unique (name)
);

create table if not exists public.gym_settings_schedule (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  day_of_week smallint not null
    check (day_of_week between 0 and 6),
  start_time time not null,
  professional_id uuid not null
    references public.professionals (id) on delete restrict,
  max_capacity integer not null
    check (max_capacity > 0),
  created_at timestamptz not null default now(),
  constraint gym_settings_schedule_unique_slot
    unique (class_id, day_of_week, start_time)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  schedule_id uuid not null references public.gym_settings_schedule (id) on delete cascade,
  date date not null,
  status text not null default 'CONFIRMED'
    check (status in ('CONFIRMED', 'CANCELLED')),
  created_at timestamptz not null default now(),
  constraint appointments_member_schedule_date_unique
    unique (member_id, schedule_id, date)
);

create index if not exists gym_settings_schedule_professional_idx
  on public.gym_settings_schedule (professional_id);

create index if not exists gym_settings_schedule_day_idx
  on public.gym_settings_schedule (day_of_week, start_time);

create index if not exists appointments_schedule_date_idx
  on public.appointments (schedule_id, date)
  where status = 'CONFIRMED';

create index if not exists appointments_member_date_idx
  on public.appointments (member_id, date);

comment on table public.classes is 'Modalidades de aula oferecidas pela academia';
comment on table public.gym_settings_schedule is 'Grade horária fixa — define dias, horários, instrutores e capacidade';
comment on table public.appointments is 'Reservas de alunos em slots da grade horária';
comment on column public.gym_settings_schedule.day_of_week is '0=domingo … 6=sábado (mesmo padrão de Date.getDay())';

-- ---------------------------------------------------------------------------
-- Função: vagas ocupadas vs capacidade
-- ---------------------------------------------------------------------------

create or replace function public.get_class_slots(p_date date, p_schedule_id uuid)
returns table (
  total_slots integer,
  occupied_slots integer,
  remaining_slots integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    gss.max_capacity as total_slots,
    coalesce(count(a.id) filter (where a.status = 'CONFIRMED'), 0)::integer as occupied_slots,
    (gss.max_capacity - coalesce(count(a.id) filter (where a.status = 'CONFIRMED'), 0))::integer
      as remaining_slots
  from public.gym_settings_schedule gss
  left join public.appointments a
    on a.schedule_id = gss.id
   and a.date = p_date
  where gss.id = p_schedule_id
  group by gss.id, gss.max_capacity;
$$;

-- Impede overbooking mesmo em requisições concorrentes
create or replace function public.enforce_appointment_capacity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_remaining integer;
begin
  if new.status <> 'CONFIRMED' then
    return new;
  end if;

  select remaining_slots
    into v_remaining
  from public.get_class_slots(new.date, new.schedule_id);

  if coalesce(v_remaining, 0) <= 0 then
    raise exception 'Não há vagas disponíveis para esta aula.';
  end if;

  return new;
end;
$$;

drop trigger if exists appointments_capacity_check on public.appointments;

create trigger appointments_capacity_check
  before insert on public.appointments
  for each row
  execute function public.enforce_appointment_capacity();

-- ---------------------------------------------------------------------------
-- Permissões e RLS
-- ---------------------------------------------------------------------------

grant all on table public.classes to authenticated, service_role;
grant all on table public.gym_settings_schedule to authenticated, service_role;
grant all on table public.appointments to authenticated, service_role;

grant execute on function public.get_class_slots(date, uuid) to authenticated, service_role;

alter table public.classes enable row level security;
alter table public.gym_settings_schedule enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "classes_select_authenticated" on public.classes;
drop policy if exists "classes_insert_authenticated" on public.classes;
drop policy if exists "classes_update_authenticated" on public.classes;
drop policy if exists "classes_delete_authenticated" on public.classes;

create policy "classes_select_authenticated"
  on public.classes for select to authenticated using (true);

create policy "classes_insert_authenticated"
  on public.classes for insert to authenticated with check (true);

create policy "classes_update_authenticated"
  on public.classes for update to authenticated using (true) with check (true);

create policy "classes_delete_authenticated"
  on public.classes for delete to authenticated using (true);

drop policy if exists "gym_settings_schedule_select_authenticated" on public.gym_settings_schedule;
drop policy if exists "gym_settings_schedule_insert_authenticated" on public.gym_settings_schedule;
drop policy if exists "gym_settings_schedule_update_authenticated" on public.gym_settings_schedule;
drop policy if exists "gym_settings_schedule_delete_authenticated" on public.gym_settings_schedule;

create policy "gym_settings_schedule_select_authenticated"
  on public.gym_settings_schedule for select to authenticated using (true);

create policy "gym_settings_schedule_insert_authenticated"
  on public.gym_settings_schedule for insert to authenticated with check (true);

create policy "gym_settings_schedule_update_authenticated"
  on public.gym_settings_schedule for update to authenticated using (true) with check (true);

create policy "gym_settings_schedule_delete_authenticated"
  on public.gym_settings_schedule for delete to authenticated using (true);

drop policy if exists "appointments_select_authenticated" on public.appointments;
drop policy if exists "appointments_insert_authenticated" on public.appointments;
drop policy if exists "appointments_update_authenticated" on public.appointments;
drop policy if exists "appointments_delete_authenticated" on public.appointments;

create policy "appointments_select_authenticated"
  on public.appointments for select to authenticated using (true);

create policy "appointments_insert_authenticated"
  on public.appointments for insert to authenticated with check (true);

create policy "appointments_update_authenticated"
  on public.appointments for update to authenticated using (true) with check (true);

create policy "appointments_delete_authenticated"
  on public.appointments for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Dados iniciais (modalidades + grade de exemplo)
-- ---------------------------------------------------------------------------

insert into public.classes (name, description)
values
  ('Crossfit', 'Treino funcional de alta intensidade'),
  ('TRX', 'Suspensão com foco em força e estabilidade'),
  ('Yoga', 'Flexibilidade, respiração e equilíbrio')
on conflict (name) do nothing;

insert into public.professionals (full_name, email, cref, birth_date, gender, shift, specialty, status)
values
  ('Ana Costa', 'ana.costa@vitalfit.local', '100001-G/SP', '1988-03-12', 'Female', 'Morning', 'Crossfit', true),
  ('Bruno Lima', 'bruno.lima@vitalfit.local', '100002-G/SP', '1985-07-22', 'Male', 'Afternoon', 'Crossfit', true),
  ('Carla Mendes', 'carla.mendes@vitalfit.local', '100003-G/SP', '1990-11-05', 'Female', 'Morning', 'Crossfit', true),
  ('Diego Souza', 'diego.souza@vitalfit.local', '100004-G/SP', '1987-01-18', 'Male', 'Morning', 'TRX', true),
  ('Elena Rocha', 'elena.rocha@vitalfit.local', '100005-G/SP', '1992-09-30', 'Female', 'Morning', 'TRX', true),
  ('Fernanda Alves', 'fernanda.alves@vitalfit.local', '100006-G/SP', '1989-04-08', 'Female', 'Morning', 'Yoga', true)
on conflict (email) do nothing;

insert into public.gym_settings_schedule (class_id, day_of_week, start_time, professional_id, max_capacity)
select c.id, slot.day_of_week, slot.start_time::time, p.id, slot.max_capacity
from public.classes c
cross join (
  values
    ('Crossfit', 1, '07:00', 'Ana Costa', 12),
    ('Crossfit', 1, '18:00', 'Bruno Lima', 15),
    ('Crossfit', 3, '07:00', 'Ana Costa', 12),
    ('Crossfit', 3, '18:00', 'Bruno Lima', 15),
    ('Crossfit', 5, '08:00', 'Carla Mendes', 12),
    ('TRX', 2, '08:00', 'Diego Souza', 10),
    ('TRX', 2, '19:00', 'Diego Souza', 10),
    ('TRX', 4, '08:00', 'Elena Rocha', 10),
    ('TRX', 4, '19:00', 'Elena Rocha', 10),
    ('Yoga', 1, '09:00', 'Fernanda Alves', 8),
    ('Yoga', 3, '09:00', 'Fernanda Alves', 8),
    ('Yoga', 5, '09:00', 'Fernanda Alves', 8)
) as slot(class_name, day_of_week, start_time, instructor_name, max_capacity)
join public.professionals p
  on p.full_name = slot.instructor_name
 and p.specialty = slot.class_name
where c.name = slot.class_name
on conflict (class_id, day_of_week, start_time) do nothing;

notify pgrst, 'reload schema';
