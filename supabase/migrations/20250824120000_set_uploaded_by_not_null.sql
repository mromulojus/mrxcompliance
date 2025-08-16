-- Ensure uploaded_by columns are enforced and default to auth.uid()

-- Remove any orphaned records without an uploader
DELETE FROM public.documentos_colaborador WHERE uploaded_by IS NULL;
DELETE FROM public.documentos_divida WHERE uploaded_by IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE public.documentos_colaborador
  ALTER COLUMN uploaded_by SET NOT NULL;

-- Function to automatically set uploaded_by to the current user
CREATE OR REPLACE FUNCTION public.set_uploaded_by()
RETURNS trigger AS $$
BEGIN
  NEW.uploaded_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Apply triggers to populate uploaded_by
DROP TRIGGER IF EXISTS set_documentos_colaborador_uploaded_by ON public.documentos_colaborador;
CREATE TRIGGER set_documentos_colaborador_uploaded_by
  BEFORE INSERT ON public.documentos_colaborador
  FOR EACH ROW EXECUTE FUNCTION public.set_uploaded_by();

DROP TRIGGER IF EXISTS set_documentos_divida_uploaded_by ON public.documentos_divida;
CREATE TRIGGER set_documentos_divida_uploaded_by
  BEFORE INSERT ON public.documentos_divida
  FOR EACH ROW EXECUTE FUNCTION public.set_uploaded_by();

-- Update RLS policies for documentos_colaborador to include ownership via uploaded_by
DROP POLICY IF EXISTS "Admin or HR of company can view documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can insert documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can update documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can delete documents" ON public.documentos_colaborador;

CREATE POLICY "Owner or HR can view documentos_colaborador" ON public.documentos_colaborador
  FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = documentos_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

CREATE POLICY "Owner or HR can insert documentos_colaborador" ON public.documentos_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND (
      public.has_role(auth.uid(), 'administrador')
      OR EXISTS (
        SELECT 1
        FROM public.colaboradores c
        WHERE c.id = colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    )
  );

CREATE POLICY "Owner or HR can update documentos_colaborador" ON public.documentos_colaborador
  FOR UPDATE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = documentos_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  )
  WITH CHECK (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

CREATE POLICY "Owner or HR can delete documentos_colaborador" ON public.documentos_colaborador
  FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1
      FROM public.colaboradores c
      WHERE c.id = documentos_colaborador.colaborador_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

-- Update documentos_divida policies to leverage uploaded_by
DROP POLICY IF EXISTS "Uploader or admin can view documentos_divida" ON public.documentos_divida;
DROP POLICY IF EXISTS "Admin can manage documentos_divida" ON public.documentos_divida;

CREATE POLICY "Uploader or admin can manage documentos_divida" ON public.documentos_divida
  FOR ALL TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'administrador'))
  WITH CHECK (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'administrador'));
