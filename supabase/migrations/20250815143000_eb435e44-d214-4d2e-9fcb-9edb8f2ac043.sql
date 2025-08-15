-- Reintroduce restrictive policies for public.denuncias
-- Drop open policies
DROP POLICY IF EXISTS "Open access to view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to delete denuncias" ON public.denuncias;

-- Allow public reporting via anonymous insert
CREATE POLICY "Public can insert denuncias" ON public.denuncias
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Restrict viewing to administrators
CREATE POLICY "Admin can view denuncias" ON public.denuncias
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'administrador') OR public.has_role(auth.uid(), 'empresarial'));

-- Restrict updates to administrators
CREATE POLICY "Admin can update denuncias" ON public.denuncias
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- Restrict deletes to administrators
CREATE POLICY "Admin can delete denuncias" ON public.denuncias
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));
