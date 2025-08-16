-- Update dividas policies to require cobranca or financeiro roles
DROP POLICY IF EXISTS "Users can view dividas based on role" ON public.dividas;
DROP POLICY IF EXISTS "View dividas with role" ON public.dividas;
DROP POLICY IF EXISTS "Manage dividas with finance roles" ON public.dividas;

CREATE POLICY "View dividas for cobranca or financeiro"
  ON public.dividas
  FOR SELECT
  USING (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'financeiro'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Insert dividas for cobranca or financeiro"
  ON public.dividas
  FOR INSERT
  WITH CHECK (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'financeiro'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Update dividas for cobranca or financeiro"
  ON public.dividas
  FOR UPDATE
  USING (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'financeiro'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  )
  WITH CHECK (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'financeiro'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Delete dividas for cobranca or financeiro"
  ON public.dividas
  FOR DELETE
  USING (
    user_can_access_empresa(empresa_id)
    AND (
      has_role(auth.uid(), 'cobranca'::user_role)
      OR has_role(auth.uid(), 'financeiro'::user_role)
      OR has_role(auth.uid(), 'administrador'::user_role)
    )
  );
