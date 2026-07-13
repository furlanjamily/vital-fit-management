-- VitalFit Management — tabela de planos (valores centralizados)
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/members.sql

create extension if not exists "pgcrypto";

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  constraint plans_name_unique unique (name)
);

comment on table public.plans is 'Planos de assinatura — name corresponde ao código em members.plan';
comment on column public.plans.name is 'Código do plano: MENSAL_BASE | TRIMESTRAL_PREMIUM | ANUAL_PRO';
comment on column public.plans.price is 'Valor do plano em BRL';

insert into public.plans (name, price)
values
  ('MENSAL_BASE', 89.90),
  ('TRIMESTRAL_PREMIUM', 229.90),
  ('ANUAL_PRO', 799.90)
on conflict (name) do update
set price = excluded.price;

grant usage on schema public to authenticated, service_role;
grant all on table public.plans to authenticated, service_role;

alter table public.plans enable row level security;

drop policy if exists "plans_select_authenticated" on public.plans;
drop policy if exists "plans_insert_authenticated" on public.plans;
drop policy if exists "plans_update_authenticated" on public.plans;
drop policy if exists "plans_delete_authenticated" on public.plans;

create policy "plans_select_authenticated"
  on public.plans for select to authenticated using (true);

create policy "plans_insert_authenticated"
  on public.plans for insert to authenticated with check (true);

create policy "plans_update_authenticated"
  on public.plans for update to authenticated using (true) with check (true);

create policy "plans_delete_authenticated"
  on public.plans for delete to authenticated using (true);

notify pgrst, 'reload schema';
