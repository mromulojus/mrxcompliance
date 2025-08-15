DROP POLICY IF EXISTS "Users can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Authenticated users can insert history" ON public.historico_colaborador;

CREATE POLICY "HR or managers can view history" ON public.historico_colaborador
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'empresarial'));

CREATE POLICY "HR or managers can insert history" ON public.historico_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'empresarial'))
    AND auth.uid() = created_by
  );
