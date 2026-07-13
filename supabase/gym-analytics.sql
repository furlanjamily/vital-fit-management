-- VitalFit Management — ocupação e fluxo de alunos (check-ins)
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/members.sql
--
-- Objetos criados:
--   • public.gym_settings   — capacidade máxima e janela de horário de pico
--   • public.check_ins      — registros de entrada na academia
--   • public.handle_new_check_in() + trigger — valida aluno ativo antes do insert
--   • public.vw_gym_flow    — agregação horária para dashboards

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Configuração da academia
-- ---------------------------------------------------------------------------

create table if not exists public.gym_settings (
  id uuid primary key default gen_random_uuid(),
  max_capacity integer not null
    check (max_capacity > 0),
  peak_start smallint not null
    check (peak_start between 0 and 23),
  peak_end smallint not null
    check (peak_end between 0 and 23),
  constraint gym_settings_peak_window_check
    check (peak_start <= peak_end)
);

comment on table public.gym_settings is 'Parâmetros operacionais da academia (capacidade e horário de pico)';
comment on column public.gym_settings.max_capacity is 'Capacidade máxima simultânea da academia';
comment on column public.gym_settings.peak_start is 'Hora de início do pico (0–23, fuso do banco)';
comment on column public.gym_settings.peak_end is 'Hora de fim do pico (0–23, fuso do banco)';

insert into public.gym_settings (max_capacity, peak_start, peak_end)
select 100, 17, 21
where not exists (select 1 from public.gym_settings);

-- ---------------------------------------------------------------------------
-- Check-ins
-- ---------------------------------------------------------------------------

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  checked_at timestamptz not null default now()
);

create index if not exists check_ins_member_id_idx
  on public.check_ins (member_id);

create index if not exists check_ins_checked_at_idx
  on public.check_ins (checked_at desc);

comment on table public.check_ins is 'Entradas de alunos na academia';
comment on column public.check_ins.checked_at is 'Momento do check-in (default: agora)';

-- ---------------------------------------------------------------------------
-- Trigger: valida aluno ativo antes de registrar check-in
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_check_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_is_active boolean;
begin
  select m.status
  into member_is_active
  from public.members m
  where m.id = new.member_id;

  if member_is_active is null then
    raise exception 'Check-in negado: aluno não encontrado (member_id = %).', new.member_id;
  end if;

  if not member_is_active then
    raise exception 'Check-in negado: aluno inativo (member_id = %).', new.member_id;
  end if;

  return new;
end;
$$;

comment on function public.handle_new_check_in() is
  'BEFORE INSERT em check_ins: bloqueia registro se o aluno não existir ou estiver inativo';

drop trigger if exists check_ins_validate_member_trigger on public.check_ins;

create trigger check_ins_validate_member_trigger
  before insert on public.check_ins
  for each row
  execute function public.handle_new_check_in();

-- ---------------------------------------------------------------------------
-- View: fluxo horário para dashboards
-- ---------------------------------------------------------------------------

create or replace view public.vw_gym_flow
with (security_invoker = true)
as
with settings as (
  select peak_start, peak_end
  from public.gym_settings
  order by id
  limit 1
)
select
  date_trunc('hour', ci.checked_at) as hour,
  count(*)::bigint as count,
  (
    extract(hour from date_trunc('hour', ci.checked_at))::int
    between s.peak_start and s.peak_end
  ) as is_peak
from public.check_ins ci
cross join settings s
group by
  date_trunc('hour', ci.checked_at),
  s.peak_start,
  s.peak_end;

comment on view public.vw_gym_flow is
  'Check-ins agrupados por hora com flag de horário de pico (gym_settings)';

-- ---------------------------------------------------------------------------
-- Permissões e RLS
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated, service_role;
grant all on table public.gym_settings to authenticated, service_role;
grant all on table public.check_ins to authenticated, service_role;
grant select on public.vw_gym_flow to authenticated, service_role;

alter table public.gym_settings enable row level security;
alter table public.check_ins enable row level security;

drop policy if exists "gym_settings_select_authenticated" on public.gym_settings;
drop policy if exists "gym_settings_insert_authenticated" on public.gym_settings;
drop policy if exists "gym_settings_update_authenticated" on public.gym_settings;
drop policy if exists "gym_settings_delete_authenticated" on public.gym_settings;

create policy "gym_settings_select_authenticated"
  on public.gym_settings for select to authenticated using (true);

create policy "gym_settings_insert_authenticated"
  on public.gym_settings for insert to authenticated with check (true);

create policy "gym_settings_update_authenticated"
  on public.gym_settings for update to authenticated using (true) with check (true);

create policy "gym_settings_delete_authenticated"
  on public.gym_settings for delete to authenticated using (true);

drop policy if exists "check_ins_select_authenticated" on public.check_ins;
drop policy if exists "check_ins_insert_authenticated" on public.check_ins;
drop policy if exists "check_ins_update_authenticated" on public.check_ins;
drop policy if exists "check_ins_delete_authenticated" on public.check_ins;

create policy "check_ins_select_authenticated"
  on public.check_ins for select to authenticated using (true);

create policy "check_ins_insert_authenticated"
  on public.check_ins for insert to authenticated with check (true);

create policy "check_ins_update_authenticated"
  on public.check_ins for update to authenticated using (true) with check (true);

create policy "check_ins_delete_authenticated"
  on public.check_ins for delete to authenticated using (true);

notify pgrst, 'reload schema';
