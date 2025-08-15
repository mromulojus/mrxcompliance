-- Atualiza a função user_can_access_empresa para remover o papel empresarial
-- e incluir o papel operacional (agente de cobrança) juntamente com
-- administrador e superuser.
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'operacional'::user_role) AND
      empresa_uuid = ANY (
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    );
$$;

-- Atualiza políticas RLS de devedores
DROP POLICY IF EXISTS "Users can view devedores based on role" ON public.devedores;
CREATE POLICY "Users can view devedores based on role"
  ON public.devedores
  FOR SELECT
  TO authenticated
  USING (user_can_access_empresa(empresa_id));

DROP POLICY IF EXISTS "Admins can manage devedores" ON public.devedores;
CREATE POLICY "Admins can manage devedores"
  ON public.devedores
  FOR ALL
  USING (
    user_can_access_empresa(empresa_id) AND
    has_role(auth.uid(), 'administrador'::user_role)
  );

