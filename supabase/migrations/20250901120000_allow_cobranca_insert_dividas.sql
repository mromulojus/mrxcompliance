-- Allow cobranca role to insert dividas (in addition to administrators)
-- This replaces the stricter policy that only allowed administrators

-- Drop old insert policy if it exists
DROP POLICY IF EXISTS "Admins can insert dividas" ON public.dividas;

-- Create new insert policy for cobranca and administrators
CREATE POLICY "Cobranca and admins can insert dividas" ON public.dividas
  FOR INSERT
  WITH CHECK (
    user_can_access_empresa(empresa_id) AND
    (
      has_role(auth.uid(), 'cobranca'::user_role) OR
      has_role(auth.uid(), 'administrador'::user_role)
    )
  );

