-- Fix empresa deletion policy to allow administrators
DROP POLICY IF EXISTS "Superusers can delete empresas" ON public.empresas;

CREATE POLICY "Superusers and admins can delete empresas" 
ON public.empresas 
FOR DELETE 
USING (
  has_role(auth.uid(), 'superuser'::user_role) OR 
  has_role(auth.uid(), 'administrador'::user_role)
);