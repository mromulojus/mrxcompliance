-- Fix whistleblower reports security vulnerability
-- Remove existing dangerous public access policies
DROP POLICY IF EXISTS "Open access to delete denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Open access to view denuncias" ON public.denuncias;

-- Create secure RLS policies for denuncias table

-- Allow public to submit denuncias (anonymous reporting)
CREATE POLICY "Public can insert denuncias"
ON public.denuncias
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only superusers and administrators can view all denuncias
CREATE POLICY "Superusers and admins can view all denuncias"
ON public.denuncias
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'superuser'::user_role) OR 
  has_role(auth.uid(), 'administrador'::user_role)
);

-- Only superusers and administrators can update denuncias
CREATE POLICY "Superusers and admins can update denuncias"
ON public.denuncias
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'superuser'::user_role) OR 
  has_role(auth.uid(), 'administrador'::user_role)
)
WITH CHECK (
  has_role(auth.uid(), 'superuser'::user_role) OR 
  has_role(auth.uid(), 'administrador'::user_role)
);

-- Only superusers can delete denuncias
CREATE POLICY "Only superusers can delete denuncias"
ON public.denuncias
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'superuser'::user_role));

-- Empresarial users can only view denuncias for their assigned companies
CREATE POLICY "Empresarial users can view company denuncias"
ON public.denuncias
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'empresarial'::user_role) AND
  empresa_id = ANY(
    SELECT unnest(empresa_ids) 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Create audit function for denuncias access
CREATE OR REPLACE FUNCTION public.log_denuncia_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (action, by_user, meta)
  VALUES (
    'denuncia_' || TG_OP,
    COALESCE(auth.jwt() ->> 'email', 'anonymous'),
    jsonb_build_object(
      'denuncia_id', COALESCE(NEW.id, OLD.id),
      'protocolo', COALESCE(NEW.protocolo, OLD.protocolo),
      'timestamp', now()
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS trigger_log_denuncia_access ON public.denuncias;
CREATE TRIGGER trigger_log_denuncia_access
  AFTER INSERT OR UPDATE OR DELETE ON public.denuncias
  FOR EACH ROW EXECUTE FUNCTION public.log_denuncia_access();
