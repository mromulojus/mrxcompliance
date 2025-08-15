-- Harden RLS policies for public.denuncias
DROP POLICY IF EXISTS "Anyone can insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admins can delete denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Public can insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can delete denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to delete denuncias" ON public.denuncias;

ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert denuncias" ON public.denuncias
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view company denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') AND
    user_can_access_empresa(empresa_id)
  );

CREATE POLICY "Admins can update company denuncias" ON public.denuncias
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') AND
    user_can_access_empresa(empresa_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'administrador') AND
    user_can_access_empresa(empresa_id)
  );

CREATE POLICY "Admins can delete company denuncias" ON public.denuncias
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador') AND
    user_can_access_empresa(empresa_id)
  );
