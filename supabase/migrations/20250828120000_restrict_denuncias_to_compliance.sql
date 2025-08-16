-- Restrict denuncias table access to compliance officers and superusers
-- Provide anonymized view for broader consumption
-- Extend audit logging for select access

-- Drop existing policies
DROP POLICY IF EXISTS "Compliance officers and admins can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can update company denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can delete company denuncias" ON public.denuncias;

-- Log read access with user and timestamp
CREATE OR REPLACE FUNCTION public.log_denuncia_access(denuncia_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES(
    'select_denuncia',
    auth.uid(),
    jsonb_build_object('denuncia_id', denuncia_id, 'timestamp', now())
  );
  RETURN true;
END;
$$;

-- Policies restricted to compliance and superusers
CREATE POLICY "Compliance and superuser can view denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('compliance','superuser')
    AND public.log_denuncia_access(id)
  );

CREATE POLICY "Compliance and superuser can update denuncias" ON public.denuncias
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('compliance','superuser'))
  WITH CHECK (public.get_user_role() IN ('compliance','superuser'));

CREATE POLICY "Compliance and superuser can delete denuncias" ON public.denuncias
  FOR DELETE TO authenticated
  USING (public.get_user_role() IN ('compliance','superuser'));

-- View masking reporter identifiers
CREATE OR REPLACE VIEW public.denuncias_public AS
SELECT
  id,
  protocolo,
  empresa_id,
  identificado,
  relacao,
  tipo,
  setor,
  conhecimento_fato,
  envolvidos_cientes,
  descricao,
  evidencias_descricao,
  sugestao,
  anexos,
  status,
  created_at,
  updated_at
FROM public.denuncias;

GRANT SELECT ON public.denuncias_public TO anon, authenticated;
