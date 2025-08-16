-- Replace colaboradores policies with stricter role-based rules and log historico access

-- Clean up old colaboradores policies
DROP POLICY IF EXISTS "Authenticated users view colaboradores with restrictions" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can delete colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Authenticated users can view colaboradores based on role" ON public.colaboradores;
DROP POLICY IF EXISTS "All authenticated users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can view colaboradores from their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can insert colaboradores for their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can update colaboradores from their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can delete colaboradores from their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Admin and superuser can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admin and superuser can update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Superuser can delete colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can delete colaboradores" ON public.colaboradores;

-- Superuser or administrador: full access
CREATE POLICY "Admins full access to colaboradores" ON public.colaboradores
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'superuser') OR public.has_role(auth.uid(), 'administrador')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'superuser') OR public.has_role(auth.uid(), 'administrador')
  );

-- Empresarial users restricted to their empresas
CREATE POLICY "Empresarial access own colaboradores" ON public.colaboradores
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'empresarial')
    AND public.user_can_access_empresa(empresa_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'empresarial')
    AND public.user_can_access_empresa(empresa_id)
  );

-- Operacional users can manage only colaboradores they created
CREATE POLICY "Operational access created colaboradores" ON public.colaboradores
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'operacional')
    AND created_by = auth.uid()
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'operacional')
    AND created_by = auth.uid()
  );

-- View and function to log historico_colaborador selects
CREATE OR REPLACE FUNCTION public.log_historico_access(h public.historico_colaborador)
RETURNS public.historico_colaborador
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (action, by_user, meta)
  VALUES (
    'view_historico_colaborador',
    auth.uid()::text,
    jsonb_build_object('historico_id', h.id, 'colaborador_id', h.colaborador_id)
  );
  RETURN h;
END;
$$;

CREATE OR REPLACE VIEW public.historico_colaborador_logged AS
SELECT (public.log_historico_access(h.*)).*
FROM public.historico_colaborador h;
