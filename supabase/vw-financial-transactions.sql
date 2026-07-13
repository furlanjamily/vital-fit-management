-- VitalFit Management — view de transações financeiras para dashboards
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/financial-transactions.sql

create or replace view public.vw_financial_transactions
with (security_invoker = true)
as
select
  id,
  member_id,
  description,
  amount,
  type,
  category_id,
  payment_method,
  transaction_date,
  created_at
from public.financial_transactions;

comment on view public.vw_financial_transactions is
  'Projeção de financial_transactions para relatórios e dashboards';

grant select on public.vw_financial_transactions to authenticated, service_role;

notify pgrst, 'reload schema';
