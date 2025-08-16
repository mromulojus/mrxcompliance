-- Drop existing SELECT policy that allowed any empresa access
DROP POLICY IF EXISTS "Users can view processos based on empresa access" ON public.processos_judiciais;

-- Drop existing admin policy to replace with stricter role-based policies
DROP POLICY IF EXISTS "Admins can manage processos" ON public.processos_judiciais;

-- Allow only advocacia or administrators to view processos for their empresa
CREATE POLICY "Advocacia or admins can view processos" 
ON public.processos_judiciais FOR SELECT
USING (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Allow only advocacia or administrators to insert processos for their empresa
CREATE POLICY "Advocacia or admins can insert processos" 
ON public.processos_judiciais FOR INSERT
WITH CHECK (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Allow only advocacia or administrators to update processos for their empresa
CREATE POLICY "Advocacia or admins can update processos" 
ON public.processos_judiciais FOR UPDATE
USING (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'administrador'::user_role)
  )
)
WITH CHECK (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Allow only advocacia or administrators to delete processos for their empresa
CREATE POLICY "Advocacia or admins can delete processos" 
ON public.processos_judiciais FOR DELETE
USING (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'administrador'::user_role)
  )
);
