-- Ajustar políticas RLS para sistema aberto (sem autenticação)

-- Remover políticas existentes que dependem de autenticação
DROP POLICY IF EXISTS "Admin and superuser can insert empresas" ON public.empresas;
DROP POLICY IF EXISTS "Admin and superuser can update empresas" ON public.empresas;
DROP POLICY IF EXISTS "All authenticated users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Superuser can delete empresas" ON public.empresas;

DROP POLICY IF EXISTS "Admin and superuser can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Admin and superuser can update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "All authenticated users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Superuser can delete colaboradores" ON public.colaboradores;

DROP POLICY IF EXISTS "Admin can view all denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Admin can update denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Anyone can insert denuncias" ON public.denuncias;

-- Criar novas políticas abertas para empresas
CREATE POLICY "Open access to view empresas" 
ON public.empresas 
FOR SELECT 
USING (true);

CREATE POLICY "Open access to insert empresas" 
ON public.empresas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Open access to update empresas" 
ON public.empresas 
FOR UPDATE 
USING (true);

CREATE POLICY "Open access to delete empresas" 
ON public.empresas 
FOR DELETE 
USING (true);

-- Criar novas políticas abertas para colaboradores
CREATE POLICY "Open access to view colaboradores" 
ON public.colaboradores 
FOR SELECT 
USING (true);

CREATE POLICY "Open access to insert colaboradores" 
ON public.colaboradores 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Open access to update colaboradores" 
ON public.colaboradores 
FOR UPDATE 
USING (true);

CREATE POLICY "Open access to delete colaboradores" 
ON public.colaboradores 
FOR DELETE 
USING (true);

-- Criar novas políticas abertas para denuncias
CREATE POLICY "Open access to view denuncias" 
ON public.denuncias 
FOR SELECT 
USING (true);

CREATE POLICY "Open access to insert denuncias" 
ON public.denuncias 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Open access to update denuncias" 
ON public.denuncias 
FOR UPDATE 
USING (true);

CREATE POLICY "Open access to delete denuncias" 
ON public.denuncias 
FOR DELETE 
USING (true);