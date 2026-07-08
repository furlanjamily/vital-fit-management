-- VitalFit Management — seed para testar members ↔ professionals
--
-- Pré-requisitos (nesta ordem):
--   1. supabase/members.sql
--   2. supabase/professionals.sql
--   3. supabase/seed-members.sql  (ou npm run seed:members)
--
-- Onde executar: Supabase Dashboard → SQL Editor → Run
--
-- Cenários cobertos:
--   • 3 personal trainers ativos + 1 inativo
--   • Alunos com e sem professor vinculado
--   • Aluno vinculado a profissional inativo (edição no formulário)

insert into public.professionals (
  id,
  full_name,
  email,
  cref,
  birth_date,
  gender,
  shift,
  status,
  avatar_url
)
values
  (
    'a1111111-1111-4111-8111-111111111101',
    'Rafael Mendes',
    'rafael.mendes@vitalfit.com',
    '123456-G/SP',
    '1990-03-15',
    'Male',
    'Morning',
    true,
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=96&q=80'
  ),
  (
    'a2222222-2222-4222-8222-222222222202',
    'Camila Rocha',
    'camila.rocha@vitalfit.com',
    '234567-G/SP',
    '1992-07-22',
    'Female',
    'Afternoon',
    true,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&q=80'
  ),
  (
    'a3333333-3333-4333-8333-333333333303',
    'Diego Ferreira',
    'diego.ferreira@vitalfit.com',
    '345678-G/RJ',
    '1988-11-08',
    'Male',
    'Night',
    true,
    null
  ),
  (
    'a4444444-4444-4444-8444-444444444404',
    'Paulo Souza',
    'paulo.souza@vitalfit.com',
    '456789-G/MG',
    '1985-01-30',
    'Male',
    'Morning',
    false,
    null
  )
on conflict (email) do nothing;

update public.members
set professional_id = 'a1111111-1111-4111-8111-111111111101'
where email in (
  'bessie.cooper@email.com',
  'jerome.bell@email.com',
  'theresa.webb@email.com',
  'ana.ribeiro@email.com',
  'carlos.lima@email.com'
);

update public.members
set professional_id = 'a2222222-2222-4222-8222-222222222202'
where email in (
  'fernanda.souza@email.com',
  'ricardo.alves@email.com',
  'pedro.costa@email.com',
  'camila.duarte@email.com'
);

update public.members
set professional_id = 'a3333333-3333-4333-8333-333333333303'
where email in (
  'lucas.ferreira@email.com',
  'beatriz.nunes@email.com',
  'larissa.oliveira@email.com'
);

update public.members
set professional_id = 'a4444444-4444-4444-8444-444444444404'
where email = 'juliana.martins@email.com';

update public.members
set professional_id = null
where email in (
  'marvin.mckinney@email.com',
  'gabriel.santos@email.com',
  'thiago.mendes@email.com',
  'patricia.gomes@email.com',
  'bruno.carvalho@email.com'
);

select
  p.full_name as personal_trainer,
  p.status as trainer_ativo,
  count(m.id) as total_alunos
from public.professionals p
left join public.members m on m.professional_id = p.id
group by p.id, p.full_name, p.status
order by p.full_name;

select count(*) as alunos_sem_professor
from public.members
where professional_id is null;
