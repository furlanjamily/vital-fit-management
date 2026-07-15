-- VitalFit Management — categorias de treino e vínculo check-in ↔ aula
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- Execute APÓS supabase/classes.sql e supabase/gym-analytics.sql

-- ---------------------------------------------------------------------------
-- Categoria da modalidade (filtro do painel Treinos favoritos)
-- Valores: funcional | cardio | mente_corpo
-- ---------------------------------------------------------------------------

alter table public.classes
  add column if not exists category text;

-- Migra categorias legadas (se a migration anterior já foi aplicada)
update public.classes
set category = case category
  when 'martial_arts' then 'funcional'
  when 'weighted' then 'funcional'
  when 'calisthenic' then 'mente_corpo'
  else category
end
where category in ('martial_arts', 'weighted', 'calisthenic');

update public.classes
set category = case name
  when 'Crossfit' then 'funcional'
  when 'TRX' then 'funcional'
  when 'Musculação' then 'funcional'
  when 'Spinning' then 'cardio'
  when 'Jump' then 'cardio'
  when 'Yoga' then 'mente_corpo'
  when 'Pilates' then 'mente_corpo'
  when 'Dança' then 'mente_corpo'
  else coalesce(category, 'funcional')
end
where category is null
   or category in ('martial_arts', 'weighted', 'calisthenic');

alter table public.classes
  alter column category set default 'funcional';

alter table public.classes
  alter column category set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'classes_category_check'
      and conrelid = 'public.classes'::regclass
  ) then
    alter table public.classes drop constraint classes_category_check;
  end if;

  alter table public.classes
    add constraint classes_category_check
    check (category in ('funcional', 'cardio', 'mente_corpo'));
end $$;

comment on column public.classes.category is
  'Categoria do treino: funcional | cardio | mente_corpo';

-- ---------------------------------------------------------------------------
-- Check-ins vinculados à modalidade frequentada
-- ---------------------------------------------------------------------------

alter table public.check_ins
  add column if not exists class_id uuid references public.classes (id) on delete set null;

create index if not exists check_ins_class_id_checked_at_idx
  on public.check_ins (class_id, checked_at desc)
  where class_id is not null;

comment on column public.check_ins.class_id is
  'Modalidade associada ao check-in (opcional; usado no painel Treinos favoritos)';

notify pgrst, 'reload schema';
