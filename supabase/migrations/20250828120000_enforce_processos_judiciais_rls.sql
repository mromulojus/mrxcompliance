-- Adjust RLS policies for processos_judiciais and related tables
-- Allow CRUD only for users with role advocacia or superuser
-- Add trigger to log process access

-- Drop existing policies on processos_judiciais
DROP POLICY IF EXISTS "Advocacia or admins can view processos" ON public.processos_judiciais;
DROP POLICY IF EXISTS "Advocacia or admins can insert processos" ON public.processos_judiciais;
DROP POLICY IF EXISTS "Advocacia or admins can update processos" ON public.processos_judiciais;
DROP POLICY IF EXISTS "Advocacia or admins can delete processos" ON public.processos_judiciais;

-- Recreate policies for processos_judiciais restricted to advocacia or superuser
CREATE POLICY "Advocacia or superusers can view processos"
ON public.processos_judiciais FOR SELECT
USING (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'superuser'::user_role)
  )
);

CREATE POLICY "Advocacia or superusers can insert processos"
ON public.processos_judiciais FOR INSERT
WITH CHECK (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'superuser'::user_role)
  )
);

CREATE POLICY "Advocacia or superusers can update processos"
ON public.processos_judiciais FOR UPDATE
USING (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'superuser'::user_role)
  )
)
WITH CHECK (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'superuser'::user_role)
  )
);

CREATE POLICY "Advocacia or superusers can delete processos"
ON public.processos_judiciais FOR DELETE
USING (
  user_can_access_empresa(empresa_id)
  AND (
    has_role(auth.uid(), 'advocacia'::user_role)
    OR has_role(auth.uid(), 'superuser'::user_role)
  )
);

-- Drop existing policies on processos_historico
DROP POLICY IF EXISTS "Users can view historico based on processo access" ON public.processos_historico;
DROP POLICY IF EXISTS "Authenticated can insert historico" ON public.processos_historico;

-- Recreate policies for processos_historico
CREATE POLICY "Advocacia or superusers can view historico"
ON public.processos_historico FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_historico.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
));

CREATE POLICY "Advocacia or superusers can insert historico"
ON public.processos_historico FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_historico.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by);

CREATE POLICY "Advocacia or superusers can update historico"
ON public.processos_historico FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_historico.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by)
WITH CHECK (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_historico.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by);

CREATE POLICY "Advocacia or superusers can delete historico"
ON public.processos_historico FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_historico.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by);

-- Drop existing policies on processos_documentos
DROP POLICY IF EXISTS "Users can view documentos based on processo access" ON public.processos_documentos;
DROP POLICY IF EXISTS "Admins can manage documentos" ON public.processos_documentos;

-- Recreate policies for processos_documentos
CREATE POLICY "Advocacia or superusers can view documentos"
ON public.processos_documentos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_documentos.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
));

CREATE POLICY "Advocacia or superusers can insert documentos"
ON public.processos_documentos FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_documentos.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = uploaded_by);

CREATE POLICY "Advocacia or superusers can update documentos"
ON public.processos_documentos FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_documentos.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = uploaded_by)
WITH CHECK (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_documentos.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = uploaded_by);

CREATE POLICY "Advocacia or superusers can delete documentos"
ON public.processos_documentos FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_documentos.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = uploaded_by);

-- Drop existing policies on processos_valores
DROP POLICY IF EXISTS "Users can view valores based on processo access" ON public.processos_valores;
DROP POLICY IF EXISTS "Admins can manage valores" ON public.processos_valores;

-- Recreate policies for processos_valores
CREATE POLICY "Advocacia or superusers can view valores"
ON public.processos_valores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_valores.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
));

CREATE POLICY "Advocacia or superusers can insert valores"
ON public.processos_valores FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_valores.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by);

CREATE POLICY "Advocacia or superusers can update valores"
ON public.processos_valores FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_valores.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by)
WITH CHECK (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_valores.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by);

CREATE POLICY "Advocacia or superusers can delete valores"
ON public.processos_valores FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.processos_judiciais pj
  WHERE pj.id = processos_valores.processo_id
    AND user_can_access_empresa(pj.empresa_id)
    AND (
      has_role(auth.uid(), 'advocacia'::user_role)
      OR has_role(auth.uid(), 'superuser'::user_role)
    )
) AND auth.uid() = created_by);

-- Audit logging function and trigger
CREATE OR REPLACE FUNCTION public.log_processos_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (action, by_user, meta)
  VALUES (
    'processo_' || TG_OP,
    COALESCE(auth.jwt() ->> 'email', 'anonymous'),
    jsonb_build_object(
      'processo_id', COALESCE(NEW.id, OLD.id),
      'numero_processo', COALESCE(NEW.numero_processo, OLD.numero_processo),
      'timestamp', now()
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS trigger_log_processos_access ON public.processos_judiciais;
CREATE TRIGGER trigger_log_processos_access
  AFTER INSERT OR UPDATE OR DELETE ON public.processos_judiciais
  FOR EACH ROW EXECUTE FUNCTION public.log_processos_access();

