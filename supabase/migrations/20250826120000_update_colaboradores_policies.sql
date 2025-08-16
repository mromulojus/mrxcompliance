-- Tighten colaboradores policies to restrict access

-- Drop overly permissive policy
DROP POLICY IF EXISTS "All authenticated users can view colaboradores" ON public.colaboradores;

-- Allow collaborators to view their own record or administrators to view any
CREATE POLICY "Self or admin can view colaborador" ON public.colaboradores
  FOR SELECT
  USING (
    auth.uid() = id
    OR has_role(auth.uid(), 'administrador'::user_role)
  );

-- Only HR administrators may insert collaborators
CREATE POLICY "HR admins can insert colaboradores" ON public.colaboradores
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'administrador'::user_role));

-- Only HR administrators may update collaborators
CREATE POLICY "HR admins can update colaboradores" ON public.colaboradores
  FOR UPDATE
  USING (has_role(auth.uid(), 'administrador'::user_role))
  WITH CHECK (has_role(auth.uid(), 'administrador'::user_role));

-- Only HR administrators may delete collaborators
CREATE POLICY "HR admins can delete colaboradores" ON public.colaboradores
  FOR DELETE
  USING (has_role(auth.uid(), 'administrador'::user_role));
