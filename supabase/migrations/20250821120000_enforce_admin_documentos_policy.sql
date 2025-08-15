-- Ensure only administrators can insert or update documentos_colaborador
DROP POLICY IF EXISTS "HR can manage documents" ON public.documentos_colaborador;
CREATE POLICY "HR can manage documents" ON public.documentos_colaborador
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'))
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));
