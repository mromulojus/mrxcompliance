-- Global system modules and MRX access adjustments

-- 1) Create global modules table
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_system_modules_updated_at
BEFORE UPDATE ON public.system_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Seed core modules (idempotent)
INSERT INTO public.system_modules (slug, name, description, color, icon)
VALUES
  ('vendas', 'VENDAS', 'Módulo comercial (xGROWTH)', '#16a34a', 'mdi-chart-line'),
  ('compliance', 'COMPLIANCE', 'Auditoria e conformidade (Mrx Compliance)', '#2563eb', 'mdi-shield-check'),
  ('juridico', 'JURIDICO', 'Gestão jurídica (MR Advocacia)', '#7c3aed', 'mdi-scale-balance'),
  ('ouvidoria', 'OUVIDORIA', 'Canais de denúncia (Ouve.ai)', '#0ea5e9', 'mdi-bullhorn'),
  ('cobranca', 'COBRANÇA', 'Cobranças e recuperação (Debto)', '#f97316', 'mdi-cash-multiple'),
  ('administrativo', 'ADMINISTRATIVO', 'Acesso geral a todos os módulos/departamentos', '#6b7280', 'mdi-cog')
ON CONFLICT (slug) DO NOTHING;

-- 3) Link departments -> system_modules
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS module_id UUID;
CREATE INDEX IF NOT EXISTS idx_departments_module ON public.departments(module_id);

-- Backfill module_id based on department slug (only when NULL)
UPDATE public.departments d
SET module_id = sm.id
FROM public.system_modules sm
WHERE d.module_id IS NULL AND sm.slug = d.slug;

-- Add FK and NOT NULL after backfill
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'departments_module_fk'
  ) THEN
    ALTER TABLE public.departments
      ADD CONSTRAINT departments_module_fk FOREIGN KEY (module_id) REFERENCES public.system_modules(id);
  END IF;
END$$;

ALTER TABLE public.departments ALTER COLUMN module_id SET NOT NULL;

-- Ensure at most one department per company per module
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'departments_unique_company_module'
  ) THEN
    ALTER TABLE public.departments
      ADD CONSTRAINT departments_unique_company_module UNIQUE (company_id, module_id);
  END IF;
END$$;

-- 4) Helper to check if current user is the special USER MRX (case/space insensitive)
CREATE OR REPLACE FUNCTION public.is_user_mrx()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND lower(regexp_replace(p.username, '\\s', '', 'g')) = 'usermrx'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- 5) Company/module helpers
CREATE OR REPLACE FUNCTION public.user_has_module_in_company(p_module_slug text, p_company_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_departments ud
    JOIN public.departments d ON d.id = ud.department_id
    JOIN public.system_modules sm ON sm.id = d.module_id
    WHERE ud.user_id = auth.uid()
      AND d.company_id = p_company_id
      AND sm.slug = p_module_slug
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

-- 6) Adjust resource visibility: allow ADMINISTRATIVO module or USER MRX to see any resource in company
CREATE OR REPLACE FUNCTION public.resource_visible_by_user(p_resource_type text, p_resource_id uuid, p_company_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super rule: USER MRX sees all
  IF public.is_user_mrx() THEN
    RETURN TRUE;
  END IF;

  -- Admin role with company access sees all
  IF public.has_role(auth.uid(), 'administrador'::public.user_role) AND public.user_can_access_empresa(p_company_id) THEN
    RETURN TRUE;
  END IF;

  -- Possessing ADMINISTRATIVO module in the company grants visibility to all
  IF public.user_has_module_in_company('administrativo', p_company_id) THEN
    RETURN TRUE;
  END IF;

  -- Otherwise require intersection of resource departments with user's departments
  RETURN EXISTS (
    SELECT 1
    FROM public.department_assignments da
    JOIN public.user_departments ud ON ud.department_id = da.department_id AND ud.user_id = auth.uid()
    WHERE da.resource_type = p_resource_type
      AND da.resource_id = p_resource_id
      AND da.company_id = p_company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7) Expand company access helpers to include USER MRX
CREATE OR REPLACE FUNCTION public.user_can_access_empresa(empresa_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    public.is_user_mrx()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND (role = 'administrador' OR role = 'superuser' OR public.profiles.empresa_id = empresa_id_param)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public;

CREATE OR REPLACE FUNCTION public.user_can_access_empresa_data(empresa_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_user_mrx() OR
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      empresa_uuid = ANY (
        SELECT unnest(empresa_ids)
        FROM public.profiles
        WHERE user_id = auth.uid()
      )
    ) OR
    (
      has_role(auth.uid(), 'operacional'::user_role) AND
      EXISTS (
        SELECT 1
        FROM public.colaboradores
        WHERE empresa_id = empresa_uuid
        AND created_by = auth.uid()
      )
    );
$$;

-- 8) Update seed function to include module_id on inserts for new companies
CREATE OR REPLACE FUNCTION public.seed_default_departments()
RETURNS VOID AS $$
DECLARE
  emp RECORD;
  dept_count INTEGER;
  m_vendas UUID;
  m_compliance UUID;
  m_juridico UUID;
  m_ouvidoria UUID;
  m_cobranca UUID;
  m_admin UUID;
BEGIN
  SELECT id INTO m_vendas FROM public.system_modules WHERE slug = 'vendas';
  SELECT id INTO m_compliance FROM public.system_modules WHERE slug = 'compliance';
  SELECT id INTO m_juridico FROM public.system_modules WHERE slug = 'juridico';
  SELECT id INTO m_ouvidoria FROM public.system_modules WHERE slug = 'ouvidoria';
  SELECT id INTO m_cobranca FROM public.system_modules WHERE slug = 'cobranca';
  SELECT id INTO m_admin FROM public.system_modules WHERE slug = 'administrativo';

  FOR emp IN SELECT id FROM public.empresas LOOP
    SELECT COUNT(*) INTO dept_count FROM public.departments WHERE company_id = emp.id;
    IF dept_count = 0 THEN
      INSERT INTO public.departments(company_id, name, slug, color, business_unit, module_id) VALUES
        (emp.id, 'VENDAS', 'vendas', '#16a34a', 'xGROWTH', m_vendas),
        (emp.id, 'COMPLIANCE', 'compliance', '#2563eb', 'Mrx Compliance', m_compliance),
        (emp.id, 'JURIDICO', 'juridico', '#7c3aed', 'MR Advocacia', m_juridico),
        (emp.id, 'OUVIDORIA', 'ouvidoria', '#0ea5e9', 'Ouve.ai', m_ouvidoria), 
        (emp.id, 'COBRANÇA', 'cobranca', '#f97316', 'Debto', m_cobranca),
        (emp.id, 'ADMINISTRATIVO', 'administrativo', '#6b7280', 'Administrativo', m_admin);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

