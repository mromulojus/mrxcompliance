-- Remove permissive policies with USING (true)
DROP POLICY IF EXISTS "All authenticated users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "All authenticated users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can view documentos of colaboradores" ON public.documentos_colaborador;
DROP POLICY IF EXISTS "Users can view history" ON public.historico_colaborador;
DROP POLICY IF EXISTS "All authenticated can insert logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Anyone can insert denuncias" ON public.denuncias;

-- Clean up previous colaboradores policies
DROP POLICY IF EXISTS "Users can view colaboradores from their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Authenticated users can view colaboradores based on role" ON public.colaboradores;
DROP POLICY IF EXISTS "Only HR and admins can view employee data" ON public.colaboradores;
DROP POLICY IF EXISTS "Authenticated users view colaboradores with restrictions" ON public.colaboradores;

-- Final policy: only administrators or the collaborator can read their data
CREATE POLICY "Admins or self can view colaborador"
ON public.colaboradores
FOR SELECT
USING (
  public.has_role(auth.uid(), 'administrador')
  OR auth.uid() = id
);
