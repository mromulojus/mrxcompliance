-- Update historico_colaborador policies: restrict viewing and inserting
DROP POLICY IF EXISTS "Admins, business or managers can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Only HR can insert history" ON public.historico_colaborador;

CREATE POLICY "Admins or company members can view history" ON public.historico_colaborador
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = historico_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

CREATE POLICY "Only HR of same company can insert history" ON public.historico_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'rh')
    AND EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = historico_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );
