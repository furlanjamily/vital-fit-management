-- VitalFit Management — seed de alunos para testes
--
-- Pré-requisito: tabela criada (supabase/members.sql)
-- Onde executar: Supabase Dashboard → SQL Editor → Run
--
-- Idempotente: ignora e-mails já cadastrados.

insert into public.members (full_name, email, cpf, birth_date, origin, plan, status, avatar_url)
values
  ('Bessie Cooper', 'bessie.cooper@email.com', '12345678901', '2000-05-24', 'ACADEMIA', 'MENSAL_BASE', true,
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80'),
  ('Jerome Bell', 'jerome.bell@email.com', '98765432100', '1995-08-15', 'GYMPASS', 'TRIMESTRAL_PREMIUM', true,
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80'),
  ('Marvin McKinney', 'marvin.mckinney@email.com', '45678912300', '1992-11-02', 'TOTALPASS', 'ANUAL_PRO', false, null),
  ('Theresa Webb', 'theresa.webb@email.com', '32165498700', '1998-01-30', 'ACADEMIA', 'MENSAL_BASE', true,
   'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=96&q=80'),
  ('Ana Paula Ribeiro', 'ana.ribeiro@email.com', '52998224725', '1993-03-12', 'ACADEMIA', 'TRIMESTRAL_PREMIUM', true, null),
  ('Carlos Eduardo Lima', 'carlos.lima@email.com', '11144477735', '1988-07-21', 'GYMPASS', 'MENSAL_BASE', true, null),
  ('Fernanda Souza', 'fernanda.souza@email.com', '22233344455', '1999-11-08', 'TOTALPASS', 'MENSAL_BASE', true,
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&q=80'),
  ('Ricardo Alves', 'ricardo.alves@email.com', '33344455566', '1990-04-17', 'ACADEMIA', 'ANUAL_PRO', true, null),
  ('Juliana Martins', 'juliana.martins@email.com', '44455566677', '1996-09-03', 'GYMPASS', 'TRIMESTRAL_PREMIUM', false, null),
  ('Pedro Henrique Costa', 'pedro.costa@email.com', '55566677788', '2001-12-25', 'ACADEMIA', 'MENSAL_BASE', true, null),
  ('Camila Duarte', 'camila.duarte@email.com', '66677788899', '1994-06-14', 'TOTALPASS', 'ANUAL_PRO', true,
   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80'),
  ('Lucas Ferreira', 'lucas.ferreira@email.com', '77788899900', '1987-02-28', 'GYMPASS', 'MENSAL_BASE', true, null),
  ('Beatriz Nunes', 'beatriz.nunes@email.com', '88899900011', '2002-08-09', 'ACADEMIA', 'TRIMESTRAL_PREMIUM', true, null),
  ('Gabriel Santos', 'gabriel.santos@email.com', '99900011122', '1991-10-31', 'TOTALPASS', 'MENSAL_BASE', false, null),
  ('Larissa Oliveira', 'larissa.oliveira@email.com', '10020030040', '1997-05-06', 'GYMPASS', 'ANUAL_PRO', true, null),
  ('Thiago Mendes', 'thiago.mendes@email.com', '11022033044', '1989-01-19', 'ACADEMIA', 'MENSAL_BASE', true, null),
  ('Patrícia Gomes', 'patricia.gomes@email.com', '12033044055', '1995-07-07', 'TOTALPASS', 'TRIMESTRAL_PREMIUM', true, null),
  ('Bruno Carvalho', 'bruno.carvalho@email.com', '13044055066', '2000-03-22', 'GYMPASS', 'MENSAL_BASE', true, null)
on conflict (email) do nothing;

-- Confirma quantos registros existem após o seed
select count(*) as total_alunos from public.members;
