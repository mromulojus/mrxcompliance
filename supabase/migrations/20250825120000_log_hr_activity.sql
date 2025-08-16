-- Log HR table access and mutations

-- Function to log SELECT on documentos_colaborador
CREATE OR REPLACE FUNCTION public.log_documentos_colaborador_access(doc_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES('select_documento', auth.uid(), jsonb_build_object('documento_id', doc_id));
  RETURN true;
END;
$$;

-- Function to log SELECT on colaboradores
CREATE OR REPLACE FUNCTION public.log_colaboradores_access(colab_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES('select_colaborador', auth.uid(), jsonb_build_object('colaborador_id', colab_id));
  RETURN true;
END;
$$;

-- Function to log SELECT on historico_colaborador
CREATE OR REPLACE FUNCTION public.log_historico_colaborador_access(hist_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES('select_historico', auth.uid(), jsonb_build_object('historico_id', hist_id));
  RETURN true;
END;
$$;

-- Trigger function for colaboradores table mutations
CREATE OR REPLACE FUNCTION public.log_colaboradores_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_text text;
  colab_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_text := 'insert_colaborador';
    colab_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    action_text := 'update_colaborador';
    colab_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'delete_colaborador';
    colab_id := OLD.id;
  END IF;

  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES(action_text, auth.uid(), jsonb_build_object('colaborador_id', colab_id));

  RETURN NEW;
END;
$$;

CREATE TRIGGER log_colaboradores_activity
AFTER INSERT OR UPDATE OR DELETE ON public.colaboradores
FOR EACH ROW EXECUTE FUNCTION public.log_colaboradores_activity();

-- Trigger function for historico_colaborador table mutations
CREATE OR REPLACE FUNCTION public.log_historico_colaborador_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_text text;
  hist_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_text := 'insert_historico';
    hist_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    action_text := 'update_historico';
    hist_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'delete_historico';
    hist_id := OLD.id;
  END IF;

  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES(action_text, auth.uid(), jsonb_build_object('historico_id', hist_id));

  RETURN NEW;
END;
$$;

CREATE TRIGGER log_historico_colaborador_activity
AFTER INSERT OR UPDATE OR DELETE ON public.historico_colaborador
FOR EACH ROW EXECUTE FUNCTION public.log_historico_colaborador_activity();

-- Update SELECT policies to include access logging
DROP POLICY IF EXISTS documentos_select_policy ON public.documentos_colaborador;
CREATE POLICY documentos_select_policy ON public.documentos_colaborador
  FOR SELECT TO authenticated
  USING (
    public.log_documentos_colaborador_access(documentos_colaborador.id) AND (
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
  );

DROP POLICY IF EXISTS "Admins or self can view colaborador" ON public.colaboradores;
CREATE POLICY "Admins or self can view colaborador" ON public.colaboradores
  FOR SELECT
  USING (
    public.log_colaboradores_access(id) AND (
      public.has_role(auth.uid(), 'administrador')
      OR auth.uid() = id
    )
  );

DROP POLICY IF EXISTS "Admins or company members can view history" ON public.historico_colaborador;
CREATE POLICY "Admins or company members can view history" ON public.historico_colaborador
  FOR SELECT TO authenticated
  USING (
    public.log_historico_colaborador_access(id) AND (
      public.has_role(auth.uid(), 'administrador')
      OR EXISTS (
        SELECT 1 FROM public.colaboradores c
        WHERE c.id = historico_colaborador.colaborador_id
          AND public.user_can_access_empresa(c.empresa_id)
      )
    )
  );
