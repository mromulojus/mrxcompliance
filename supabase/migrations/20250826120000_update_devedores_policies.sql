-- Remove old policy allowing multiple roles to view devedores
DROP POLICY IF EXISTS "Users can view devedores based on role" ON public.devedores;

-- Allow cobranca role or administrators to view devedores for their empresa
CREATE POLICY "Cobranca can view devedores"
  ON public.devedores
  FOR SELECT
  TO authenticated
  USING (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  );

-- Update management policy to include cobranca role
DROP POLICY IF EXISTS "Admins can manage devedores" ON public.devedores;
CREATE POLICY "Cobranca can manage devedores"
  ON public.devedores
  FOR INSERT, UPDATE, DELETE
  USING (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  )
  WITH CHECK (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  );
