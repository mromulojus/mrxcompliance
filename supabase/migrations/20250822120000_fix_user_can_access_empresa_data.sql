-- Ensure user has real vínculo with company when checking access
CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Superusers e administradores têm acesso total
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    -- Usuários empresariais só acessam suas empresas
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      empresa_uuid = ANY (
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    ) OR
    -- Usuários operacionais acessam empresas onde trabalham
    (
      has_role(auth.uid(), 'operacional'::user_role) AND
      EXISTS (
        SELECT 1
        FROM public.colaboradores
        WHERE empresa_id = empresa_uuid
        AND created_by = auth.uid()
      )
    );
$$;
