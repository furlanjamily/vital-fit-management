-- VitalFit — integração profissionais ↔ grade de aulas
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → Run
-- Execute APÓS supabase/professionals.sql e supabase/classes.sql

-- ---------------------------------------------------------------------------
-- 1. Especialidade em professionals
-- ---------------------------------------------------------------------------

alter table public.professionals
  add column if not exists specialty text;

update public.professionals
set specialty = 'Crossfit'
where specialty is null;

alter table public.professionals
  alter column specialty set not null;

alter table public.professionals
  drop constraint if exists professionals_specialty_check;

alter table public.professionals
  add constraint professionals_specialty_check
  check (specialty in (
    'Musculação', 'Dança', 'Yoga', 'Spinning', 'Jump', 'Pilates', 'Crossfit', 'TRX'
  ));

create index if not exists professionals_specialty_idx
  on public.professionals (specialty);

comment on column public.professionals.specialty is
  'Modalidade/especialidade do profissional — deve coincidir com classes.name para vincular na grade';

-- ---------------------------------------------------------------------------
-- 2. FK professional_id em gym_settings_schedule
-- ---------------------------------------------------------------------------

alter table public.gym_settings_schedule
  add column if not exists professional_id uuid
  references public.professionals (id) on delete restrict;

-- Migra registros existentes: cria profissionais a partir de instructor_name + modalidade
do $$
declare
  rec record;
  v_professional_id uuid;
  v_email text;
  v_cref text;
  v_counter integer := 0;
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'gym_settings_schedule'
      and column_name = 'instructor_name'
  ) then
    return;
  end if;

  for rec in
    select distinct
      gss.instructor_name,
      c.name as class_name
    from public.gym_settings_schedule gss
    join public.classes c on c.id = gss.class_id
    where gss.professional_id is null
  loop
    select p.id
      into v_professional_id
    from public.professionals p
    where p.full_name = rec.instructor_name
      and p.specialty = rec.class_name
    limit 1;

    if v_professional_id is null then
      v_counter := v_counter + 1;
      v_email := lower(replace(rec.instructor_name, ' ', '.')) || '.' || v_counter || '@vitalfit.local';
      v_cref := lpad(v_counter::text, 6, '0') || '-G/SP';

      insert into public.professionals (
        full_name, email, cref, birth_date, gender, shift, status, specialty
      )
      values (
        rec.instructor_name,
        v_email,
        v_cref,
        '1990-01-01',
        'Other',
        'Morning',
        true,
        rec.class_name
      )
      returning id into v_professional_id;
    end if;

    update public.gym_settings_schedule gss
    set professional_id = v_professional_id
    from public.classes c
    where gss.class_id = c.id
      and gss.instructor_name = rec.instructor_name
      and c.name = rec.class_name
      and gss.professional_id is null;
  end loop;
end $$;

-- Remove coluna legada após migração
alter table public.gym_settings_schedule
  drop column if exists instructor_name;

alter table public.gym_settings_schedule
  alter column professional_id set not null;

create index if not exists gym_settings_schedule_professional_idx
  on public.gym_settings_schedule (professional_id);

-- ---------------------------------------------------------------------------
-- 3. Turno integral (FullTime) em professionals
-- ---------------------------------------------------------------------------

alter table public.professionals
  drop constraint if exists professionals_shift_check;

alter table public.professionals
  add constraint professionals_shift_check
  check (shift in ('Morning', 'Afternoon', 'Night', 'FullTime'));

notify pgrst, 'reload schema';
