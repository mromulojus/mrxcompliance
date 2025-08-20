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

-- Atualizar políticas RLS da tabela boards para permitir superusers
DROP POLICY IF EXISTS "Users can create boards for their company" ON public.boards;
DROP POLICY IF EXISTS "Users can view boards from their company" ON public.boards;
DROP POLICY IF EXISTS "Users can update boards from their company" ON public.boards; 
DROP POLICY IF EXISTS "Users can delete boards from their company" ON public.boards;

CREATE POLICY "Users can create boards for their company" ON public.boards
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'superuser'::user_role) OR
  (empresa_id IN (SELECT unnest(profiles.empresa_ids) FROM profiles WHERE profiles.user_id = auth.uid()))
);

CREATE POLICY "Users can view boards from their company" ON public.boards  
FOR SELECT USING (
  has_role(auth.uid(), 'superuser'::user_role) OR
  (empresa_id IN (SELECT unnest(profiles.empresa_ids) FROM profiles WHERE profiles.user_id = auth.uid()))
);

CREATE POLICY "Users can update boards from their company" ON public.boards
FOR UPDATE USING (
  has_role(auth.uid(), 'superuser'::user_role) OR  
  (empresa_id IN (SELECT unnest(profiles.empresa_ids) FROM profiles WHERE profiles.user_id = auth.uid()))
);

CREATE POLICY "Users can delete boards from their company" ON public.boards
FOR DELETE USING (
  has_role(auth.uid(), 'superuser'::user_role) OR
  (empresa_id IN (SELECT unnest(profiles.empresa_ids) FROM profiles WHERE profiles.user_id = auth.uuid()))
);