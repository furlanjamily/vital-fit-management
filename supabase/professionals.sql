-- VitalFit Management — tabela de profissionais (personal trainers) + vínculo com alunos
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/members.sql (adiciona FK em members)

create extension if not exists "pgcrypto";

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  avatar_url text,
  full_name text not null,
  email text not null,
  cref text not null,
  birth_date date not null,
  gender text not null
    check (gender in ('Male', 'Female', 'Other')),
  shift text not null
    check (shift in ('Morning', 'Afternoon', 'Night')),
  status boolean not null default true,
  created_at timestamptz not null default now(),
  constraint professionals_email_unique unique (email),
  constraint professionals_cref_unique unique (cref)
);

create index if not exists professionals_status_idx on public.professionals (status);
create index if not exists professionals_shift_idx on public.professionals (shift);
create index if not exists professionals_created_at_idx on public.professionals (created_at desc);

comment on table public.professionals is 'Personal trainers / profissionais da academia';
comment on column public.professionals.cref is 'Registro CREF (Conselho Regional de Educação Física)';
comment on column public.professionals.gender is 'Male | Female | Other';
comment on column public.professionals.shift is 'Morning | Afternoon | Night';
comment on column public.professionals.status is 'true = ativo, false = inativo';

alter table public.members
  add column if not exists professional_id uuid
  references public.professionals (id)
  on delete set null;

create index if not exists members_professional_id_idx on public.members (professional_id);

comment on column public.members.professional_id is 'Personal trainer vinculado (nullable)';

grant usage on schema public to authenticated, service_role;
grant all on table public.professionals to authenticated, service_role;

alter table public.professionals enable row level security;

drop policy if exists "professionals_select_authenticated" on public.professionals;
drop policy if exists "professionals_insert_authenticated" on public.professionals;
drop policy if exists "professionals_update_authenticated" on public.professionals;
drop policy if exists "professionals_delete_authenticated" on public.professionals;

create policy "professionals_select_authenticated"
  on public.professionals for select to authenticated using (true);

create policy "professionals_insert_authenticated"
  on public.professionals for insert to authenticated with check (true);

create policy "professionals_update_authenticated"
  on public.professionals for update to authenticated using (true) with check (true);

create policy "professionals_delete_authenticated"
  on public.professionals for delete to authenticated using (true);

notify pgrst, 'reload schema';
