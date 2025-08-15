-- CRITICAL SECURITY FIX: Secure whistleblower reports
-- Remove existing permissive policies
DROP POLICY IF EXISTS "Users can view denuncias from their empresas" ON public.denuncias;
DROP POLICY IF EXISTS "Users can insert denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Users can update denuncias from their empresas" ON public.denuncias;
DROP POLICY IF EXISTS "Users can delete denuncias from their empresas" ON public.denuncias;

-- Create secure policies for whistleblower reports
CREATE POLICY "Only admins can view whistleblower reports" 
ON public.denuncias 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('administrador', 'superuser')
  )
);

CREATE POLICY "Anonymous public can submit reports" 
ON public.denuncias 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can update reports" 
ON public.denuncias 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('administrador', 'superuser')
  )
);

CREATE POLICY "Only admins can delete reports" 
ON public.denuncias 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('administrador', 'superuser')
  )
);

-- CRITICAL SECURITY FIX: Secure employee data
-- Remove existing permissive policies
DROP POLICY IF EXISTS "Users can view colaboradores from their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can insert colaboradores for their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can update colaboradores from their empresas" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can delete colaboradores from their empresas" ON public.colaboradores;

-- Create secure policies for employee data
CREATE POLICY "Only HR and admins can view employee data" 
ON public.colaboradores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = colaboradores.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'rh' AND p.empresa_id = e.id)
    )
  )
);

CREATE POLICY "Only HR and admins can insert employee data" 
ON public.colaboradores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'rh' AND p.empresa_id = colaboradores.empresa_id)
    )
  )
);

CREATE POLICY "Only HR and admins can update employee data" 
ON public.colaboradores 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = colaboradores.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'rh' AND p.empresa_id = e.id)
    )
  )
);

CREATE POLICY "Only HR and admins can delete employee data" 
ON public.colaboradores 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = colaboradores.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'rh' AND p.empresa_id = e.id)
    )
  )
);

-- CRITICAL SECURITY FIX: Secure debtor data
-- Remove existing permissive policies
DROP POLICY IF EXISTS "Users can view devedores from their empresas" ON public.devedores;
DROP POLICY IF EXISTS "Users can insert devedores for their empresas" ON public.devedores;
DROP POLICY IF EXISTS "Users can update devedores from their empresas" ON public.devedores;
DROP POLICY IF EXISTS "Users can delete devedores from their empresas" ON public.devedores;

-- Create secure policies for debtor data
CREATE POLICY "Only authorized collection staff can view debtor data" 
ON public.devedores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = devedores.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'cobranca' AND p.empresa_id = e.id)
    )
  )
);

CREATE POLICY "Only authorized collection staff can insert debtor data" 
ON public.devedores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'cobranca' AND p.empresa_id = devedores.empresa_id)
    )
  )
);

CREATE POLICY "Only authorized collection staff can update debtor data" 
ON public.devedores 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = devedores.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'cobranca' AND p.empresa_id = e.id)
    )
  )
);

CREATE POLICY "Only authorized collection staff can delete debtor data" 
ON public.devedores 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = devedores.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role = 'cobranca' AND p.empresa_id = e.id)
    )
  )
);

-- CRITICAL SECURITY FIX: Secure financial data
-- Remove existing permissive policies for dividas
DROP POLICY IF EXISTS "Users can view dividas from their empresas" ON public.dividas;
DROP POLICY IF EXISTS "Users can insert dividas for their empresas" ON public.dividas;
DROP POLICY IF EXISTS "Users can update dividas from their empresas" ON public.dividas;
DROP POLICY IF EXISTS "Users can delete dividas from their empresas" ON public.dividas;

-- Create secure policies for debt data
CREATE POLICY "Only authorized financial staff can view debt data" 
ON public.dividas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = dividas.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role IN ('cobranca', 'financeiro') AND p.empresa_id = e.id)
    )
  )
);

CREATE POLICY "Only authorized financial staff can insert debt data" 
ON public.dividas 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role IN ('cobranca', 'financeiro') AND p.empresa_id = dividas.empresa_id)
    )
  )
);

CREATE POLICY "Only authorized financial staff can update debt data" 
ON public.dividas 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = dividas.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role IN ('cobranca', 'financeiro') AND p.empresa_id = e.id)
    )
  )
);

CREATE POLICY "Only authorized financial staff can delete debt data" 
ON public.dividas 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.empresas e ON e.id = dividas.empresa_id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role IN ('administrador', 'superuser') OR
      (p.role IN ('cobranca', 'financeiro') AND p.empresa_id = e.id)
    )
  )
);

-- Fix database functions security vulnerabilities
-- Add search_path protection to prevent SQL injection

CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() 
    AND (role = 'administrador' OR role = 'superuser' OR public.profiles.empresa_id = empresa_id_param)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT empresa_id FROM public.profiles
    WHERE user_id = auth.uid() 
    AND role != 'administrador' 
    AND role != 'superuser'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
