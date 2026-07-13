-- VitalFit Management — vencimento de mensalidade (last_payment_date / next_due_date)
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/members.sql, supabase/plans.sql e supabase/financial-transactions.sql

-- ---------------------------------------------------------------------------
-- Colunas de controle de vencimento
-- ---------------------------------------------------------------------------

alter table public.members
  add column if not exists last_payment_date date;

alter table public.members
  add column if not exists next_due_date date;

comment on column public.members.last_payment_date is 'Data do último pagamento de mensalidade confirmado';
comment on column public.members.next_due_date is 'Próximo vencimento calculado conforme o plano';

create index if not exists members_next_due_date_idx on public.members (next_due_date);

-- ---------------------------------------------------------------------------
-- Cálculo do próximo vencimento por plano
-- ---------------------------------------------------------------------------

create or replace function public.calculate_next_due_date(start_date date, plan_type text)
returns date
language plpgsql
immutable
set search_path = public
as $$
begin
  case plan_type
    when 'MENSAL_BASE' then
      return (start_date + interval '1 month')::date;
    when 'TRIMESTRAL_PREMIUM' then
      return (start_date + interval '3 months')::date;
    when 'ANUAL_PRO' then
      return (start_date + interval '12 months')::date;
    else
      raise exception 'Plano inválido: %', plan_type;
  end case;
end;
$$;

comment on function public.calculate_next_due_date(date, text) is
  'MENSAL_BASE +1 mês | TRIMESTRAL_PREMIUM +3 meses | ANUAL_PRO +12 meses';

-- ---------------------------------------------------------------------------
-- Trigger: ao inserir receita de mensalidade, atualiza datas do aluno
-- ---------------------------------------------------------------------------

create or replace function public.on_member_payment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_plan text;
begin
  if new.member_id is null then
    return new;
  end if;

  if new.type is distinct from 'RECEITA' then
    return new;
  end if;

  if not exists (
    select 1
    from public.financial_categories c
    where c.id = new.category_id
      and c.type = 'RECEITA'
      and c.is_system = true
      and c.name = 'Mensalidade'
  ) then
    return new;
  end if;

  select plan
  into member_plan
  from public.members
  where id = new.member_id;

  if member_plan is null then
    raise exception 'Aluno sem plano definido. Não é possível registrar pagamento.';
  end if;

  update public.members
  set
    last_payment_date = new.transaction_date,
    next_due_date = public.calculate_next_due_date(new.transaction_date, member_plan),
    payment_status = true,
    last_payment_method = new.payment_method
  where id = new.member_id;

  return new;
end;
$$;

drop trigger if exists on_member_payment_update on public.financial_transactions;

create trigger on_member_payment_update
  after insert on public.financial_transactions
  for each row
  execute function public.on_member_payment_update();

notify pgrst, 'reload schema';
