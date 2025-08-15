-- Allow cobranca role to view devedores
DROP POLICY IF EXISTS "Users can view devedores based on role" ON public.devedores;

CREATE POLICY "Users can view devedores based on role"
  ON public.devedores
  FOR SELECT
  TO authenticated
  USING (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'operacional'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
      OR has_role(auth.uid(), 'cobranca'::user_role)
    )
  );

-- Ensure DML operations remain restricted to admins
DROP POLICY IF EXISTS "Admins can manage devedores" ON public.devedores;
CREATE POLICY "Admins can manage devedores"
  ON public.devedores
  FOR INSERT, UPDATE, DELETE
  USING (
    user_can_access_empresa(empresa_id)
    AND has_role(auth.uid(), 'administrador'::user_role)
  )
  WITH CHECK (
    user_can_access_empresa(empresa_id)
    AND has_role(auth.uid(), 'administrador'::user_role)
  );
