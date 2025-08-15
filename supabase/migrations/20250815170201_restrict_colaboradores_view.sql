-- Restrict colaboradores view to administrators and allowed empresa users

-- 1. Remove old open policies
DROP POLICY IF EXISTS "All authenticated users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Authenticated users can view colaboradores based on role" ON public.colaboradores;

-- 2. New SELECT policy
CREATE POLICY "Authenticated users view colaboradores with restrictions"
ON public.colaboradores
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::user_role)
  OR (
    has_role(auth.uid(), 'empresarial'::user_role)
    AND user_can_access_empresa(empresa_id)
  )
);

-- 3. INSERT policy restricted to administrators
DROP POLICY IF EXISTS "Admin and superuser can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can insert colaboradores" ON public.colaboradores;
CREATE POLICY "Admins can insert colaboradores"
ON public.colaboradores
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'administrador'::user_role)
  OR has_role(auth.uid(), 'superuser'::user_role)
);

-- 4. UPDATE policy restricted to administrators
DROP POLICY IF EXISTS "Admin and superuser can update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can update colaboradores" ON public.colaboradores;
CREATE POLICY "Admins can update colaboradores"
ON public.colaboradores
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::user_role)
  OR has_role(auth.uid(), 'superuser'::user_role)
)
WITH CHECK (
  has_role(auth.uid(), 'administrador'::user_role)
  OR has_role(auth.uid(), 'superuser'::user_role)
);

-- 5. DELETE policy restricted to administrators
DROP POLICY IF EXISTS "Superuser can delete colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admins can delete colaboradores" ON public.colaboradores;
CREATE POLICY "Admins can delete colaboradores"
ON public.colaboradores
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'administrador'::user_role)
  OR has_role(auth.uid(), 'superuser'::user_role)
);
