-- Restrict documentos_colaborador policies to company administrators or HR

-- Remove outdated policies
DROP POLICY IF EXISTS "Document owner or HR can view documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "HR can manage documents" ON public.documentos_colaborador;

-- Administrators or company HR can view documents
CREATE POLICY "Admin or HR of company can view documents" ON public.documentos_colaborador
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') OR
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = documentos_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

-- Administrators or company HR can insert documents
CREATE POLICY "Admin or HR of company can insert documents" ON public.documentos_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'administrador') OR
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

-- Administrators or company HR can update documents
CREATE POLICY "Admin or HR of company can update documents" ON public.documentos_colaborador
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') OR
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = documentos_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'administrador') OR
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

-- Administrators or company HR can delete documents
CREATE POLICY "Admin or HR of company can delete documents" ON public.documentos_colaborador
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') OR
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = documentos_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );
