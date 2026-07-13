-- VitalFit Management — categorias financeiras dinâmicas
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/financial-transactions.sql

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabela de categorias
-- ---------------------------------------------------------------------------

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('RECEITA', 'DESPESA')),
  color text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  constraint financial_categories_name_type_unique unique (name, type)
);

comment on table public.financial_categories is 'Categorias dinâmicas de receitas e despesas';
comment on column public.financial_categories.is_system is 'Categorias do sistema (ex.: Mensalidade) não podem ser removidas';

create index if not exists financial_categories_type_idx
  on public.financial_categories (type);

-- ---------------------------------------------------------------------------
-- Seed inicial (mapeamento das categorias legadas)
-- ---------------------------------------------------------------------------

insert into public.financial_categories (name, type, color, is_system)
values
  ('Mensalidade', 'RECEITA', '#22C55E', true),
  ('Venda de produtos', 'RECEITA', '#FFB300', false),
  ('Serviços avulsos', 'RECEITA', '#FF7A00', false),
  ('Parcerias / convênios', 'RECEITA', '#FF4D3D', false),
  ('Outros (receita)', 'RECEITA', '#FFF2AF', false),
  ('Equipamentos', 'DESPESA', '#FF7A00', false),
  ('Salários', 'DESPESA', '#FF4D3D', false),
  ('Marketing', 'DESPESA', '#FFB300', false),
  ('Operacional', 'DESPESA', '#F97316', false),
  ('Outros (despesa)', 'DESPESA', '#FFF2AF', false)
on conflict (name, type) do nothing;

-- ---------------------------------------------------------------------------
-- Migração: category (text) → category_id (FK)
-- ---------------------------------------------------------------------------

alter table public.financial_transactions
  add column if not exists category_id uuid references public.financial_categories (id);

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'MENSALIDADE'
  and c.name = 'Mensalidade'
  and c.type = 'RECEITA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'VENDA_PRODUTOS'
  and c.name = 'Venda de produtos'
  and c.type = 'RECEITA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'SERVICOS_AVULSOS'
  and c.name = 'Serviços avulsos'
  and c.type = 'RECEITA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'PARCERIA'
  and c.name = 'Parcerias / convênios'
  and c.type = 'RECEITA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'EQUIPAMENTO'
  and c.name = 'Equipamentos'
  and c.type = 'DESPESA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'SALARIO'
  and c.name = 'Salários'
  and c.type = 'DESPESA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'MARKETING'
  and c.name = 'Marketing'
  and c.type = 'DESPESA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'OPERACIONAL'
  and c.name = 'Operacional'
  and c.type = 'DESPESA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'OUTROS'
  and t.type = 'RECEITA'
  and c.name = 'Outros (receita)'
  and c.type = 'RECEITA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.category = 'OUTROS'
  and t.type = 'DESPESA'
  and c.name = 'Outros (despesa)'
  and c.type = 'DESPESA';

-- Fallback para registros órfãos
update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.type = 'RECEITA'
  and c.name = 'Outros (receita)'
  and c.type = 'RECEITA';

update public.financial_transactions t
set category_id = c.id
from public.financial_categories c
where t.category_id is null
  and t.type = 'DESPESA'
  and c.name = 'Outros (despesa)'
  and c.type = 'DESPESA';

alter table public.financial_transactions
  drop column if exists category;

alter table public.financial_transactions
  alter column category_id set not null;

create index if not exists financial_transactions_category_id_idx
  on public.financial_transactions (category_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

grant all on table public.financial_categories to authenticated, service_role;

alter table public.financial_categories enable row level security;

drop policy if exists "financial_categories_select_authenticated" on public.financial_categories;
drop policy if exists "financial_categories_insert_authenticated" on public.financial_categories;
drop policy if exists "financial_categories_update_authenticated" on public.financial_categories;
drop policy if exists "financial_categories_delete_authenticated" on public.financial_categories;

create policy "financial_categories_select_authenticated"
  on public.financial_categories for select to authenticated using (true);

create policy "financial_categories_insert_authenticated"
  on public.financial_categories for insert to authenticated with check (true);

create policy "financial_categories_update_authenticated"
  on public.financial_categories for update to authenticated using (true) with check (true);

create policy "financial_categories_delete_authenticated"
  on public.financial_categories for delete to authenticated using (not is_system);

notify pgrst, 'reload schema';
