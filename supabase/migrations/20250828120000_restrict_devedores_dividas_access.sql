-- Restrict devedores and dividas policies to cobranca and administrators
-- Add auditing triggers and functions

-- Log SELECT access for devedores
CREATE OR REPLACE FUNCTION public.log_devedores_access(devedor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES('select_devedor', auth.uid(), jsonb_build_object('devedor_id', devedor_id));
  RETURN true;
END;
$$;

-- Log SELECT access for dividas
CREATE OR REPLACE FUNCTION public.log_dividas_access(divida_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES('select_divida', auth.uid(), jsonb_build_object('divida_id', divida_id));
  RETURN true;
END;
$$;

-- Generic trigger for table mutations
CREATE OR REPLACE FUNCTION public.log_historico_cobranca()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs(action, by_user, meta)
  VALUES(
    TG_TABLE_NAME || '_' || lower(TG_OP),
    auth.uid(),
    jsonb_build_object('table', TG_TABLE_NAME, 'id', COALESCE(NEW.id, OLD.id))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers to devedores and dividas
DROP TRIGGER IF EXISTS log_devedores_activity ON public.devedores;
CREATE TRIGGER log_devedores_activity
AFTER INSERT OR UPDATE OR DELETE ON public.devedores
FOR EACH ROW EXECUTE FUNCTION public.log_historico_cobranca();

DROP TRIGGER IF EXISTS log_dividas_activity ON public.dividas;
CREATE TRIGGER log_dividas_activity
AFTER INSERT OR UPDATE OR DELETE ON public.dividas
FOR EACH ROW EXECUTE FUNCTION public.log_historico_cobranca();

-- Reset existing policies
DROP POLICY IF EXISTS "Cobranca can view devedores" ON public.devedores;
DROP POLICY IF EXISTS "Cobranca can manage devedores" ON public.devedores;
DROP POLICY IF EXISTS "View dividas for cobranca or financeiro" ON public.dividas;
DROP POLICY IF EXISTS "Insert dividas for cobranca or financeiro" ON public.dividas;
DROP POLICY IF EXISTS "Update dividas for cobranca or financeiro" ON public.dividas;
DROP POLICY IF EXISTS "Delete dividas for cobranca or financeiro" ON public.dividas;

-- Devedores policies
CREATE POLICY "Cobranca and admins can select devedores" ON public.devedores
  FOR SELECT USING (true);
ALTER POLICY "Cobranca and admins can select devedores" ON public.devedores
  USING (
    public.log_devedores_access(id) AND
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Cobranca and admins can update devedores" ON public.devedores
  FOR UPDATE USING (true) WITH CHECK (true);
ALTER POLICY "Cobranca and admins can update devedores" ON public.devedores
  USING (
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  )
  WITH CHECK (
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Admins can insert devedores" ON public.devedores
  FOR INSERT
  WITH CHECK (
    user_can_access_empresa(empresa_id) AND
    has_role(auth.uid(), 'administrador'::user_role)
  );

CREATE POLICY "Admins can delete devedores" ON public.devedores
  FOR DELETE
  USING (
    user_can_access_empresa(empresa_id) AND
    has_role(auth.uid(), 'administrador'::user_role)
  );

-- Dividas policies
CREATE POLICY "Cobranca and admins can select dividas" ON public.dividas
  FOR SELECT USING (true);
ALTER POLICY "Cobranca and admins can select dividas" ON public.dividas
  USING (
    public.log_dividas_access(id) AND
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Cobranca and admins can update dividas" ON public.dividas
  FOR UPDATE USING (true) WITH CHECK (true);
ALTER POLICY "Cobranca and admins can update dividas" ON public.dividas
  USING (
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  )
  WITH CHECK (
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Admins can insert dividas" ON public.dividas
  FOR INSERT
  WITH CHECK (
    user_can_access_empresa(empresa_id) AND
    has_role(auth.uid(), 'administrador'::user_role)
  );

CREATE POLICY "Admins can delete dividas" ON public.dividas
  FOR DELETE
  USING (
    user_can_access_empresa(empresa_id) AND
    has_role(auth.uid(), 'administrador'::user_role)
  );
