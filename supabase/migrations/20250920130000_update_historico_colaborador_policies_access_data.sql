-- Update historico_colaborador RLS to use user_can_access_empresa_data

-- Clean up prior policies to avoid duplicates/conflicts
DROP POLICY IF EXISTS "Users with company access can view historico_colaborador" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Users with company access can insert historico_colaborador" ON public.historico_colaborador;

-- View policy: any authenticated user who can access the collaborator's company (via user_can_access_empresa_data)
CREATE POLICY "Users with company access can view historico_colaborador"
  ON public.historico_colaborador
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = historico_colaborador.colaborador_id
        AND public.user_can_access_empresa_data(c.empresa_id)
    )
  );

-- Insert policy: require access to the company AND that created_by matches the authenticated user
CREATE POLICY "Users with company access can insert historico_colaborador"
  ON public.historico_colaborador
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = historico_colaborador.colaborador_id
        AND public.user_can_access_empresa_data(c.empresa_id)
    )
  );

