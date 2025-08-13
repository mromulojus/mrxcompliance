-- Remover políticas perigosas existentes que permitem acesso público total às empresas
DROP POLICY IF EXISTS "Open access to view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Open access to insert empresas" ON public.empresas;
DROP POLICY IF EXISTS "Open access to update empresas" ON public.empresas;
DROP POLICY IF EXISTS "Open access to delete empresas" ON public.empresas;

-- Criar políticas RLS seguras para proteger dados comerciais sensíveis

-- 1. POLÍTICA DE VISUALIZAÇÃO: Controle baseado em roles e associação com empresas
CREATE POLICY "Authenticated users can view empresas based on role and association" 
ON public.empresas 
FOR SELECT 
TO authenticated
USING (
  -- Superusers podem ver todas as empresas
  has_role(auth.uid(), 'superuser'::user_role) OR
  -- Administradores podem ver todas as empresas
  has_role(auth.uid(), 'administrador'::user_role) OR
  -- Usuários empresariais podem ver apenas suas empresas associadas
  (
    has_role(auth.uid(), 'empresarial'::user_role) AND
    id = ANY(
      SELECT unnest(empresa_ids) 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  ) OR
  -- Usuários operacionais podem ver empresas onde trabalham (através de colaboradores)
  (
    has_role(auth.uid(), 'operacional'::user_role) AND
    id IN (
      SELECT DISTINCT empresa_id::uuid 
      FROM public.colaboradores 
      WHERE created_by = auth.uid() OR updated_at IS NOT NULL
    )
  )
);

-- 2. POLÍTICA DE INSERÇÃO: Apenas administradores e superusers podem criar empresas
CREATE POLICY "Admins can insert empresas" 
ON public.empresas 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'superuser'::user_role) OR
  has_role(auth.uid(), 'administrador'::user_role)
);

-- 3. POLÍTICA DE ATUALIZAÇÃO: Administradores e usuários empresariais autorizados
CREATE POLICY "Authorized users can update empresas" 
ON public.empresas 
FOR UPDATE 
TO authenticated
USING (
  -- Superusers podem modificar qualquer empresa
  has_role(auth.uid(), 'superuser'::user_role) OR
  -- Administradores podem modificar qualquer empresa
  has_role(auth.uid(), 'administrador'::user_role) OR
  -- Usuários empresariais podem modificar apenas suas empresas
  (
    has_role(auth.uid(), 'empresarial'::user_role) AND
    id = ANY(
      SELECT unnest(empresa_ids) 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  -- Mesmas regras para verificação de dados atualizados
  has_role(auth.uid(), 'superuser'::user_role) OR
  has_role(auth.uid(), 'administrador'::user_role) OR
  (
    has_role(auth.uid(), 'empresarial'::user_role) AND
    id = ANY(
      SELECT unnest(empresa_ids) 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- 4. POLÍTICA DE EXCLUSÃO: Apenas superusers podem deletar empresas
CREATE POLICY "Superusers can delete empresas" 
ON public.empresas 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'superuser'::user_role)
);

-- Criar função auxiliar para verificar se usuário pode acessar dados de uma empresa específica
CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    -- Superusers e administradores têm acesso total
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    -- Usuários empresariais só acessam suas empresas
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      empresa_uuid = ANY(
        SELECT unnest(empresa_ids) 
        FROM public.profiles 
        WHERE user_id = auth.uid()
      )
    ) OR
    -- Usuários operacionais acessam empresas onde trabalham
    (
      has_role(auth.uid(), 'operacional'::user_role) AND
      EXISTS (
        SELECT 1 
        FROM public.colaboradores 
        WHERE empresa_id = empresa_uuid 
        AND (created_by = auth.uid() OR updated_at IS NOT NULL)
      )
    );
$$;

-- Adicionar índice para melhorar performance das consultas de segurança
CREATE INDEX IF NOT EXISTS idx_profiles_user_empresa_ids ON public.profiles USING GIN (empresa_ids);
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_created_by ON public.colaboradores (empresa_id, created_by);