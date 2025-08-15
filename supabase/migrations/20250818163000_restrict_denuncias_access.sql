-- Restrict access to public.denuncias to administrators only
DROP POLICY IF EXISTS "Open access to view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to delete denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Public can insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can delete denuncias" ON public.denuncias;

ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert denuncias" ON public.denuncias
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can update denuncias" ON public.denuncias
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admins can delete denuncias" ON public.denuncias
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));
