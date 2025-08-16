-- Drop permissive policy and redefine access rules for documentos_colaborador
-- 1. Remove existing policies including open USING (true) policy
DROP POLICY IF EXISTS "Users can view documents of colaboradores" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can manage documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can update documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin can delete documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can view documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can insert documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can update documents" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Admin or HR of company can delete documents" ON public.documentos_colaborador;

-- 2. Role-based policies for SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "documentos_select_policy" ON public.documentos_colaborador
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'superuser') OR
    public.has_role(auth.uid(), 'administrador') OR
    (
      public.has_role(auth.uid(), 'empresarial') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = documentos_colaborador.colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    ) OR (
      public.has_role(auth.uid(), 'operacional') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = documentos_colaborador.colaborador_id
          AND c.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "documentos_insert_policy" ON public.documentos_colaborador
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'superuser') OR
    public.has_role(auth.uid(), 'administrador') OR
    (
      public.has_role(auth.uid(), 'empresarial') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    ) OR (
      public.has_role(auth.uid(), 'operacional') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = colaborador_id
          AND c.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "documentos_update_policy" ON public.documentos_colaborador
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'superuser') OR
    public.has_role(auth.uid(), 'administrador') OR
    (
      public.has_role(auth.uid(), 'empresarial') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = documentos_colaborador.colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    ) OR (
      public.has_role(auth.uid(), 'operacional') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = documentos_colaborador.colaborador_id
          AND c.created_by = auth.uid()
      )
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'superuser') OR
    public.has_role(auth.uid(), 'administrador') OR
    (
      public.has_role(auth.uid(), 'empresarial') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    ) OR (
      public.has_role(auth.uid(), 'operacional') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = colaborador_id
          AND c.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "documentos_delete_policy" ON public.documentos_colaborador
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'superuser') OR
    public.has_role(auth.uid(), 'administrador') OR
    (
      public.has_role(auth.uid(), 'empresarial') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = documentos_colaborador.colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    ) OR (
      public.has_role(auth.uid(), 'operacional') AND
      EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = documentos_colaborador.colaborador_id
          AND c.created_by = auth.uid()
      )
    )
  );

-- 3. Trigger to log document activity (insert/update/delete)
CREATE OR REPLACE FUNCTION public.log_documentos_colaborador_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_text text;
  doc_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_text := 'insert_documento';
    doc_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    action_text := 'update_documento';
    doc_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'delete_documento';
    doc_id := OLD.id;
  END IF;

  INSERT INTO public.activity_logs (action, by_user, meta)
  VALUES (action_text, auth.uid(), jsonb_build_object('documento_id', doc_id));

  RETURN NEW;
END;
$$;

CREATE TRIGGER log_documentos_colaborador_activity
AFTER INSERT OR UPDATE OR DELETE ON public.documentos_colaborador
FOR EACH ROW EXECUTE FUNCTION public.log_documentos_colaborador_activity();
