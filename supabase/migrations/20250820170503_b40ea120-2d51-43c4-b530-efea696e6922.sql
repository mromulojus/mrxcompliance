-- Inserir perfil manualmente para o usuário específico
INSERT INTO public.profiles (user_id, username, full_name, role, empresa_ids, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'contato@mrxbr.com' LIMIT 1),
  'contato@mrxbr.com',
  'Administrador',
  'superuser'::user_role,
  ARRAY['011b6067-2463-490d-907f-ca06e228591b']::uuid[],
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  empresa_ids = EXCLUDED.empresa_ids,
  role = EXCLUDED.role;