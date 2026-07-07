-- VitalFit Management — tabela de alunos (members)
-- Execute no SQL Editor do Supabase antes de usar /members com dados reais.

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

-- Row Level Security — usuários autenticados podem fazer CRUD.
-- Para restringir a admins, substitua (true) por uma checagem de role, ex.:
--   (auth.jwt() -> 'user_metadata' ->> 'role') in ('SUPER_ADMIN', 'ADMIN')

alter table public.members enable row level security;

create policy "members_select_authenticated"
  on public.members
  for select
  to authenticated
  using (true);

create policy "members_insert_authenticated"
  on public.members
  for insert
  to authenticated
  with check (true);

create policy "members_update_authenticated"
  on public.members
  for update
  to authenticated
  using (true)
  with check (true);

create policy "members_delete_authenticated"
  on public.members
  for delete
  to authenticated
  using (true);
