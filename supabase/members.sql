-- VitalFit Management — tabela de alunos (members)
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
-- (NÃO execute via cliente autenticado nem o hint de auth.users)
--
-- Este script NÃO toca em auth.users. Ignore erros/hints sobre auth.users
-- ao configurar alunos — gestão de usuários do sistema usa Admin API.

create extension if not exists "pgcrypto";

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  cpf text not null,
  birth_date date not null,
  origin text not null
    check (origin in ('ACADEMIA', 'GYMPASS', 'TOTALPASS')),
  plan text
    check (plan is null or plan in ('MENSAL_BASE', 'TRIMESTRAL_PREMIUM', 'ANUAL_PRO')),
  status boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  constraint members_email_unique unique (email),
  constraint members_cpf_unique unique (cpf)
);

create index if not exists members_status_idx on public.members (status);
create index if not exists members_created_at_idx on public.members (created_at desc);

comment on table public.members is 'Matrículas / alunos da academia';
comment on column public.members.cpf is 'CPF armazenado apenas com dígitos (11 caracteres)';
comment on column public.members.status is 'true = ativo, false = inativo';

-- Permissões de tabela (obrigatório para RLS funcionar com role authenticated)
grant usage on schema public to authenticated, service_role;
grant all on table public.members to authenticated, service_role;

alter table public.members enable row level security;

-- Idempotente: remove policies antigas antes de recriar
drop policy if exists "members_select_authenticated" on public.members;
drop policy if exists "members_insert_authenticated" on public.members;
drop policy if exists "members_update_authenticated" on public.members;
drop policy if exists "members_delete_authenticated" on public.members;

create policy "members_select_authenticated"
  on public.members for select to authenticated using (true);

create policy "members_insert_authenticated"
  on public.members for insert to authenticated with check (true);

create policy "members_update_authenticated"
  on public.members for update to authenticated using (true) with check (true);

create policy "members_delete_authenticated"
  on public.members for delete to authenticated using (true);

-- Recarrega o schema cache do PostgREST
notify pgrst, 'reload schema';
