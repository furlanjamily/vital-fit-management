-- VitalFit Management — relatórios financeiros (queries + RPC)
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/financial-transactions.sql
--
-- Também pode chamar as funções RPC via Supabase client:
--   supabase.rpc('financial_balance_today')
--   supabase.rpc('financial_balance_month')
--   supabase.rpc('financial_balance_year')

-- ---------------------------------------------------------------------------
-- Queries ad-hoc (Supabase SQL Editor)
-- ---------------------------------------------------------------------------

-- Saldo do dia atual (Receitas − Despesas)
-- select coalesce(sum(
--   case
--     when type = 'RECEITA' then amount
--     when type = 'DESPESA' then -amount
--     else 0
--   end
-- ), 0) as saldo_dia
-- from public.financial_transactions
-- where transaction_date = current_date;

-- Saldo do mês corrente
-- select coalesce(sum(
--   case
--     when type = 'RECEITA' then amount
--     when type = 'DESPESA' then -amount
--     else 0
--   end
-- ), 0) as saldo_mes
-- from public.financial_transactions
-- where transaction_date >= date_trunc('month', current_date)::date
--   and transaction_date < (date_trunc('month', current_date) + interval '1 month')::date;

-- Saldo acumulado do ano
-- select coalesce(sum(
--   case
--     when type = 'RECEITA' then amount
--     when type = 'DESPESA' then -amount
--     else 0
--   end
-- ), 0) as saldo_ano
-- from public.financial_transactions
-- where transaction_date >= date_trunc('year', current_date)::date
--   and transaction_date < (date_trunc('year', current_date) + interval '1 year')::date;

-- ---------------------------------------------------------------------------
-- Funções RPC (retorno detalhado: receitas, despesas, saldo)
-- ---------------------------------------------------------------------------

create or replace function public.financial_balance_today()
returns table (receitas numeric, despesas numeric, saldo numeric)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(sum(case when type = 'RECEITA' then amount else 0 end), 0) as receitas,
    coalesce(sum(case when type = 'DESPESA' then amount else 0 end), 0) as despesas,
    coalesce(sum(
      case
        when type = 'RECEITA' then amount
        when type = 'DESPESA' then -amount
        else 0
      end
    ), 0) as saldo
  from public.financial_transactions
  where transaction_date = current_date;
$$;

create or replace function public.financial_balance_month()
returns table (receitas numeric, despesas numeric, saldo numeric)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(sum(case when type = 'RECEITA' then amount else 0 end), 0) as receitas,
    coalesce(sum(case when type = 'DESPESA' then amount else 0 end), 0) as despesas,
    coalesce(sum(
      case
        when type = 'RECEITA' then amount
        when type = 'DESPESA' then -amount
        else 0
      end
    ), 0) as saldo
  from public.financial_transactions
  where transaction_date >= date_trunc('month', current_date)::date
    and transaction_date < (date_trunc('month', current_date) + interval '1 month')::date;
$$;

create or replace function public.financial_balance_year()
returns table (receitas numeric, despesas numeric, saldo numeric)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(sum(case when type = 'RECEITA' then amount else 0 end), 0) as receitas,
    coalesce(sum(case when type = 'DESPESA' then amount else 0 end), 0) as despesas,
    coalesce(sum(
      case
        when type = 'RECEITA' then amount
        when type = 'DESPESA' then -amount
        else 0
      end
    ), 0) as saldo
  from public.financial_transactions
  where transaction_date >= date_trunc('year', current_date)::date
    and transaction_date < (date_trunc('year', current_date) + interval '1 year')::date;
$$;

grant execute on function public.financial_balance_today() to authenticated, service_role;
grant execute on function public.financial_balance_month() to authenticated, service_role;
grant execute on function public.financial_balance_year() to authenticated, service_role;

notify pgrst, 'reload schema';
