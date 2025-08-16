-- Secure denuncias access and sanitize metadata

-- Drop existing policies that expose denuncias to general users
DROP POLICY IF EXISTS "Admins can view company denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can update company denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can delete company denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Empresarial users can view company denuncias" ON public.denuncias;

-- Ensure compliance role exists
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'compliance';

-- Update has_role function to handle compliance role
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
      OR (required_role = 'compliance' AND role IN ('administrador', 'compliance'))
    )
  );
$$;

-- Sanitize metadata fields to reduce deanonymization risk
ALTER TABLE public.denuncias
  ALTER COLUMN created_at TYPE DATE USING (created_at::date),
  ALTER COLUMN created_at SET DEFAULT CURRENT_DATE,
  ALTER COLUMN updated_at TYPE DATE USING (updated_at::date),
  ALTER COLUMN updated_at SET DEFAULT CURRENT_DATE;

ALTER TABLE public.comentarios_denuncia
  ALTER COLUMN created_at TYPE DATE USING (created_at::date),
  ALTER COLUMN created_at SET DEFAULT CURRENT_DATE;

-- Update trigger function to work with DATE type
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Introduce restrictive policies allowing only compliance officers or admins to view denuncias
CREATE POLICY "Compliance officers and admins can view denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'compliance') OR
    (public.has_role(auth.uid(), 'administrador') AND user_can_access_empresa(empresa_id))
  );

CREATE POLICY "Admins can update company denuncias" ON public.denuncias
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') AND user_can_access_empresa(empresa_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'administrador') AND user_can_access_empresa(empresa_id)
  );

CREATE POLICY "Admins can delete company denuncias" ON public.denuncias
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') AND user_can_access_empresa(empresa_id)
  );
