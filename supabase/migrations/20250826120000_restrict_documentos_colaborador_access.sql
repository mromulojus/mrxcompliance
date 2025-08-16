-- Tighten access to documentos_colaborador
-- 1. Drop permissive policies
DROP POLICY IF EXISTS "Users can view documents of colaboradores" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can manage documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can update documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can delete documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can view documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can insert documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can update documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can delete documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "documentos_select_policy" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "documentos_insert_policy" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "documentos_update_policy" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "documentos_delete_policy" ON public.documentos_colaborador;

-- 2. Enforce strict access rules
-- Users may select their own documents or administrators/HR with matching empresa
CREATE POLICY "Own or company admin/HR can view documentos" ON public.documentos_colaborador
  FOR SELECT TO authenticated
  USING (
    auth.uid() = colaborador_id OR
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = documentos_colaborador.colaborador_id
        AND p.user_id = auth.uid()
        AND p.role IN ('administrador', 'rh')
    )
  );

-- Only HR or administrators of same company can insert documents
CREATE POLICY "Company admin/HR can insert documentos" ON public.documentos_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = colaborador_id
        AND p.user_id = auth.uid()
        AND p.role IN ('administrador', 'rh')
    )
  );

-- Only HR or administrators of same company can update documents
CREATE POLICY "Company admin/HR can update documentos" ON public.documentos_colaborador
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = documentos_colaborador.colaborador_id
        AND p.user_id = auth.uid()
        AND p.role IN ('administrador', 'rh')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = colaborador_id
        AND p.user_id = auth.uid()
        AND p.role IN ('administrador', 'rh')
    )
  );

-- Only HR or administrators of same company can delete documents
CREATE POLICY "Company admin/HR can delete documentos" ON public.documentos_colaborador
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.colaboradores c
      JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = documentos_colaborador.colaborador_id
        AND p.user_id = auth.uid()
        AND p.role IN ('administrador', 'rh')
    )
  );
