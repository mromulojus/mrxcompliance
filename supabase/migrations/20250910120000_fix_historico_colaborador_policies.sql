-- Fix historico_colaborador RLS to allow inserts/views for users with access to the collaborator's company

-- Drop conflicting/old policies
DROP POLICY IF EXISTS "Admins, business or managers can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Only HR can insert history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Admins or company members can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Only HR of same company can insert history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "HR or managers can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "HR or managers can insert history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Managers can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Managers can insert history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Users can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Authenticated users can insert history" ON public.historico_colaborador;

-- View policy: any authenticated user who can access the collaborator's company (via user_can_access_empresa)
CREATE POLICY "Users with company access can view historico_colaborador"
  ON public.historico_colaborador
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = historico_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

-- Insert policy: require same company access AND that created_by matches the authenticated user
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
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

