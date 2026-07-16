-- VitalFit Management — bucket público para fotos de perfil
--
-- ONDE EXECUTAR: Supabase Dashboard → SQL Editor → New query → Run
--
-- Avatares de usuários NÃO devem ir em user_metadata como base64
-- (isso infla o JWT/cookie e causa HTTP 431).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  524288,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública (URLs permanentes)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Escrita/atualização/remoção via service role (Admin API) — sem policy de insert
-- para authenticated; o app sobe arquivos com SUPABASE_SERVICE_ROLE_KEY.

notify pgrst, 'reload schema';
