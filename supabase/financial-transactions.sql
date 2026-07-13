-- VitalFit Management — transações financeiras
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/financial-categories.sql, supabase/members.sql e supabase/plans.sql
-- Receitas de mensalidade disparam on_member_payment_update (supabase/members-payment-dates.sql)

create extension if not exists "pgcrypto";

-- Migração idempotente para bancos que já tinham members antes desta feature
alter table public.members
  add column if not exists payment_status boolean not null default false;

alter table public.members
  add column if not exists last_payment_method text;

alter table public.members
  drop constraint if exists members_last_payment_method_check;

alter table public.members
  add constraint members_last_payment_method_check
  check (
    last_payment_method is null
    or last_payment_method in ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'BOLETO')
  );

comment on column public.members.payment_status is 'true = mensalidade paga no ciclo atual';
comment on column public.members.last_payment_method is 'Forma de pagamento usada na última confirmação de mensalidade';

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members (id) on delete set null,
  description text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  type text not null check (type in ('RECEITA', 'DESPESA')),
  category_id uuid not null references public.financial_categories (id),
  payment_method text not null
    check (payment_method in ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'BOLETO')),
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists financial_transactions_category_id_idx
  on public.financial_transactions (category_id);

create index if not exists financial_transactions_transaction_date_idx
  on public.financial_transactions (transaction_date desc);

create index if not exists financial_transactions_type_idx
  on public.financial_transactions (type);

create index if not exists financial_transactions_member_id_idx
  on public.financial_transactions (member_id);

comment on table public.financial_transactions is 'Lançamentos financeiros (receitas e despesas)';

-- Remove trigger legado (mensalidade agora é registrada via Server Action em /members)
drop trigger if exists members_payment_status_trigger on public.members;
drop function if exists public.handle_member_payment();

grant usage on schema public to authenticated, service_role;
grant all on table public.financial_transactions to authenticated, service_role;

alter table public.financial_transactions enable row level security;

drop policy if exists "financial_transactions_select_authenticated" on public.financial_transactions;
drop policy if exists "financial_transactions_insert_authenticated" on public.financial_transactions;
drop policy if exists "financial_transactions_update_authenticated" on public.financial_transactions;
drop policy if exists "financial_transactions_delete_authenticated" on public.financial_transactions;

create policy "financial_transactions_select_authenticated"
  on public.financial_transactions for select to authenticated using (true);

create policy "financial_transactions_insert_authenticated"
  on public.financial_transactions for insert to authenticated with check (true);

create policy "financial_transactions_update_authenticated"
  on public.financial_transactions for update to authenticated using (true) with check (true);

create policy "financial_transactions_delete_authenticated"
  on public.financial_transactions for delete to authenticated using (true);

notify pgrst, 'reload schema';
