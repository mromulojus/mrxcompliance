-- Remover políticas perigosas existentes que permitem acesso público total
DROP POLICY IF EXISTS "Open access to view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Open access to insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Open access to update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Open access to delete colaboradores" ON public.colaboradores;

-- Criar políticas RLS seguras para proteger dados pessoais dos colaboradores

-- 1. POLÍTICA DE VISUALIZAÇÃO: Apenas usuários autenticados com roles adequados
CREATE POLICY "Authenticated users can view colaboradores based on role" 
ON public.colaboradores 
FOR SELECT 
TO authenticated
USING (
  -- Superusers podem ver todos
  has_role(auth.uid(), 'superuser'::user_role) OR
  -- Administradores podem ver todos
  has_role(auth.uid(), 'administrador'::user_role) OR
  -- Usuários empresariais podem ver apenas colaboradores de suas empresas
  (
    has_role(auth.uid(), 'empresarial'::user_role) AND
    empresa_id = ANY(
      SELECT unnest(empresa_ids) 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- 2. POLÍTICA DE INSERÇÃO: Apenas administradores podem adicionar colaboradores
CREATE POLICY "Admins can insert colaboradores" 
ON public.colaboradores 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'superuser'::user_role) OR
  has_role(auth.uid(), 'administrador'::user_role)
);

-- 3. POLÍTICA DE ATUALIZAÇÃO: Apenas administradores podem modificar
CREATE POLICY "Admins can update colaboradores" 
ON public.colaboradores 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'superuser'::user_role) OR
  has_role(auth.uid(), 'administrador'::user_role)
)
WITH CHECK (
  has_role(auth.uid(), 'superuser'::user_role) OR
  has_role(auth.uid(), 'administrador'::user_role)
);

-- 4. POLÍTICA DE EXCLUSÃO: Apenas superusers podem deletar
CREATE POLICY "Superusers can delete colaboradores" 
ON public.colaboradores 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'superuser'::user_role)
);

-- Criar função auxiliar para verificar acesso a empresa específica
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      empresa_uuid = ANY(
        SELECT unnest(empresa_ids) 
        FROM public.profiles 
        WHERE user_id = auth.uid()
      )
    );
$$;
