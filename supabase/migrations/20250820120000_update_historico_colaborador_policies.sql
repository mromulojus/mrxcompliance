-- Tighten historico_colaborador policies: restrict open access
DROP POLICY IF EXISTS "Users can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Authenticated users can insert history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "HR or managers can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "HR or managers can insert history" ON public.historico_colaborador;

CREATE POLICY "Admins, business or managers can view history" ON public.historico_colaborador
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') OR
    public.has_role(auth.uid(), 'empresarial') OR
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = historico_colaborador.colaborador_id
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Only HR can insert history" ON public.historico_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'rh') AND auth.uid() = created_by
  );
