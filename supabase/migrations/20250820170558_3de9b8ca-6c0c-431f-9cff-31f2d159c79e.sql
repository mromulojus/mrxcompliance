-- Corrigir o perfil para o usuário correto
DELETE FROM public.profiles WHERE username = 'contato@mrxbr.com';

INSERT INTO public.profiles (user_id, username, full_name, role, empresa_ids, is_active)
VALUES (
  'b4fe1c93-51d0-4ce5-8893-22c4cc971aaf',
  'mradv.oab@gmail.com', 
  'Administrador',
  'superuser'::user_role,
  ARRAY['011b6067-2463-490d-907f-ca06e228591b']::uuid[],
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  empresa_ids = EXCLUDED.empresa_ids,
  role = EXCLUDED.role;