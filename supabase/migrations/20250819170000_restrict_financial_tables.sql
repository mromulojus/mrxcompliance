-- Add specialized financial roles
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'financeiro_master';

-- Update has_role function to account for new roles
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid
    AND (
      role = required_role
      OR role = 'superuser'
      OR (required_role = 'operacional' AND role IN ('empresarial', 'administrador', 'financeiro', 'financeiro_master'))
      OR (required_role = 'empresarial' AND role IN ('administrador', 'financeiro_master'))
      OR (required_role = 'financeiro' AND role = 'financeiro_master')
    )
  );
$$;

-- Dividas policies
DROP POLICY IF EXISTS "Users can view dividas based on role" ON public.dividas;
DROP POLICY IF EXISTS "Admins can manage dividas" ON public.dividas;

CREATE POLICY "View dividas with role" ON public.dividas
  FOR SELECT USING (
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'operacional'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Manage dividas with finance roles" ON public.dividas
  FOR ALL USING (
    user_can_access_empresa(empresa_id) AND (
      has_role(auth.uid(), 'administrador'::user_role) OR
      has_role(auth.uid(), 'financeiro'::user_role) OR
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  ) WITH CHECK (
    user_can_access_empresa(empresa_id) AND (
      has_role(auth.uid(), 'administrador'::user_role) OR
      has_role(auth.uid(), 'financeiro'::user_role) OR
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  );

-- Acordos policies
DROP POLICY IF EXISTS "Users can view acordos based on empresa access" ON public.acordos;
DROP POLICY IF EXISTS "Admins can manage acordos" ON public.acordos;

CREATE POLICY "View acordos with role" ON public.acordos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dividas d
      WHERE d.id = acordos.divida_id
      AND user_can_access_empresa(d.empresa_id)
    ) AND (
      has_role(auth.uid(), 'operacional'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Manage acordos with finance roles" ON public.acordos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dividas d
      WHERE d.id = divida_id
      AND user_can_access_empresa(d.empresa_id)
    ) AND (
      has_role(auth.uid(), 'administrador'::user_role) OR
      has_role(auth.uid(), 'financeiro'::user_role) OR
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dividas d
      WHERE d.id = divida_id
      AND user_can_access_empresa(d.empresa_id)
    ) AND (
      has_role(auth.uid(), 'administrador'::user_role) OR
      has_role(auth.uid(), 'financeiro'::user_role) OR
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  );

-- Pagamentos policies
DROP POLICY IF EXISTS "Users can view pagamentos based on empresa access" ON public.pagamentos;
DROP POLICY IF EXISTS "Admins can manage pagamentos" ON public.pagamentos;

CREATE POLICY "View pagamentos with role" ON public.pagamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dividas d
      WHERE d.id = pagamentos.divida_id
      AND user_can_access_empresa(d.empresa_id)
    ) AND (
      has_role(auth.uid(), 'operacional'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

CREATE POLICY "Manage pagamentos with finance roles" ON public.pagamentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dividas d
      WHERE d.id = divida_id
      AND user_can_access_empresa(d.empresa_id)
    ) AND (
      has_role(auth.uid(), 'administrador'::user_role) OR
      has_role(auth.uid(), 'financeiro'::user_role) OR
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dividas d
      WHERE d.id = divida_id
      AND user_can_access_empresa(d.empresa_id)
    ) AND (
      has_role(auth.uid(), 'administrador'::user_role) OR
      has_role(auth.uid(), 'financeiro'::user_role) OR
      has_role(auth.uid(), 'financeiro_master'::user_role)
    )
  );

