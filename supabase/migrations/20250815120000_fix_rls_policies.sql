-- Restrict access to sensitive tables

-- Denuncias: remove open policies
DROP POLICY IF EXISTS "Open access to view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to delete denuncias" ON public.denuncias;

-- Restore restricted policies for denuncias
CREATE POLICY "Admin can view denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Anyone can insert denuncias" ON public.denuncias
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update denuncias" ON public.denuncias
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admin can delete denuncias" ON public.denuncias
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- Documentos_colaborador: tighten access
DROP POLICY IF EXISTS "Users can view documents of colaboradores" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can manage documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can update documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can delete documents" ON public.documentos_colaborador;

CREATE POLICY "Document owner or HR can view documents" ON public.documentos_colaborador
  FOR SELECT TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "HR can manage documents" ON public.documentos_colaborador
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- Historico_colaborador: restrict visibility
DROP POLICY IF EXISTS "Users can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "Authenticated users can insert history" ON public.historico_colaborador;

CREATE POLICY "Managers can view history" ON public.historico_colaborador
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'empresarial'));

CREATE POLICY "Managers can insert history" ON public.historico_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'empresarial') AND auth.uid() = created_by);
