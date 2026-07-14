-- VitalFit — status PENDING (aguardando) em appointments
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → Run
-- Execute APÓS supabase/classes.sql
--
-- Permite agendamentos "aguardando" que não ocupam vaga até confirmação.

alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('CONFIRMED', 'CANCELLED', 'PENDING'));

comment on column public.appointments.status is
  'CONFIRMED = confirmado | PENDING = aguardando | CANCELLED = cancelado';

notify pgrst, 'reload schema';
