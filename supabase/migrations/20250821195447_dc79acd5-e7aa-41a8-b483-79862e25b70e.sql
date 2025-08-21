-- 1. Atualizar colaboradores existentes com created_by nulo
-- Usar o ID de um usuário ativo como fallback
UPDATE colaboradores 
SET created_by = (
  SELECT user_id 
  FROM profiles 
  WHERE is_active = true 
  AND role IN ('superuser', 'administrador')
  LIMIT 1
)
WHERE created_by IS NULL;

-- 2. Ajustar a política RLS para ser mais flexível
DROP POLICY IF EXISTS "Authenticated users can view colaboradores based on role" ON colaboradores;

CREATE POLICY "Users can view colaboradores based on empresa access"
ON colaboradores 
FOR SELECT 
TO authenticated
USING (
  -- Superusers e administradores podem ver tudo
  has_role(auth.uid(), 'superuser') OR 
  has_role(auth.uid(), 'administrador') OR
  -- Usuários empresariais podem ver colaboradores de suas empresas
  (
    has_role(auth.uid(), 'empresarial') AND
    empresa_id = ANY(
      SELECT unnest(empresa_ids) 
      FROM profiles 
      WHERE user_id = auth.uid()
    )
  ) OR
  -- Permitir acesso se o usuário tem acesso à empresa (função existente)
  user_can_access_empresa_data(empresa_id)
);

-- 3. Criar política mais flexível para inserção
DROP POLICY IF EXISTS "Admins can insert colaboradores" ON colaboradores;

CREATE POLICY "Authenticated users can insert colaboradores"
ON colaboradores 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'superuser') OR 
  has_role(auth.uid(), 'administrador') OR
  user_can_access_empresa_data(empresa_id)
);

-- 4. Tornar created_by obrigatório para novos registros
ALTER TABLE colaboradores 
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- 5. Remover a função de debug temporária
DROP FUNCTION public.debug_colaboradores();