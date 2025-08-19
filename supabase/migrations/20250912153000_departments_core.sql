-- Departamentos: modelo central, vínculos de usuários e atribuições a recursos
-- Assumimos Postgres + Supabase com funções auxiliares: has_role, user_can_access_empresa, user_can_access_empresa_data

-- 1) Tabelas principais
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT,
  business_unit TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT departments_name_unique UNIQUE (company_id, name),
  CONSTRAINT departments_slug_unique UNIQUE (company_id, slug)
);

CREATE INDEX idx_departments_company ON public.departments(company_id);

CREATE TABLE public.user_departments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role_in_department TEXT NOT NULL DEFAULT 'member', -- 'member' | 'admin'
  is_primary BOOLEAN NOT NULL DEFAULT false,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, department_id)
);

CREATE INDEX idx_user_departments_user ON public.user_departments(user_id);
CREATE INDEX idx_user_departments_department ON public.user_departments(department_id);

-- Atribuições polimórficas de departamento a recursos (ex.: 'tarefas')
CREATE TABLE public.department_assignments (
  resource_type TEXT NOT NULL, -- ex.: 'tarefas', 'boards', 'cards'
  resource_id UUID NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT department_assignments_pk PRIMARY KEY (resource_type, resource_id, department_id)
);

CREATE INDEX idx_department_assignments_resource ON public.department_assignments(resource_type, resource_id);
CREATE INDEX idx_department_assignments_department ON public.department_assignments(department_id);
CREATE INDEX idx_department_assignments_company ON public.department_assignments(company_id);

-- Garantir um único principal por recurso
CREATE UNIQUE INDEX department_assignments_one_primary_per_resource
  ON public.department_assignments(resource_type, resource_id)
  WHERE is_primary;

-- Trigger genérico para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_departments_updated_at
BEFORE UPDATE ON public.user_departments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_department_assignments_updated_at
BEFORE UPDATE ON public.department_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Validações e helpers
-- Validar que company_id da atribuição bate com o do departamento
CREATE OR REPLACE FUNCTION public.validate_department_assignment_company()
RETURNS TRIGGER AS $$
DECLARE
  dept_company UUID;
BEGIN
  SELECT company_id INTO dept_company FROM public.departments WHERE id = NEW.department_id;
  IF dept_company IS NULL THEN
    RAISE EXCEPTION 'Departamento inexistente (%)', NEW.department_id;
  END IF;
  IF NEW.company_id IS DISTINCT FROM dept_company THEN
    RAISE EXCEPTION 'company_id da atribuição (%) deve corresponder ao company_id do departamento (%)', NEW.company_id, dept_company;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_department_assignments_company_check
BEFORE INSERT OR UPDATE ON public.department_assignments
FOR EACH ROW EXECUTE FUNCTION public.validate_department_assignment_company();

-- Helpers de acesso
CREATE OR REPLACE FUNCTION public.user_belongs_to_department(p_department_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_departments ud
    WHERE ud.department_id = p_department_id AND ud.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_is_department_admin(p_department_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_departments ud
    WHERE ud.department_id = p_department_id AND ud.user_id = auth.uid() AND ud.role_in_department = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.resource_visible_by_user(p_resource_type text, p_resource_id uuid, p_company_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin da empresa vê tudo
  IF public.has_role(auth.uid(), 'administrador'::public.user_role) AND public.user_can_access_empresa(p_company_id) THEN
    RETURN TRUE;
  END IF;
  -- Visível se houver interseção de departamentos do recurso com os do usuário
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

-- 3) RLS Policies
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_assignments ENABLE ROW LEVEL SECURITY;

-- departments
CREATE POLICY dept_select ON public.departments
  FOR SELECT USING (public.user_can_access_empresa(company_id));

CREATE POLICY dept_modify ON public.departments
  FOR ALL TO authenticated
  USING (
    public.user_can_access_empresa(company_id)
    AND (public.has_role(auth.uid(), 'administrador'::public.user_role) OR public.has_role(auth.uid(), 'empresarial'::public.user_role))
  )
  WITH CHECK (
    public.user_can_access_empresa(company_id)
    AND (public.has_role(auth.uid(), 'administrador'::public.user_role) OR public.has_role(auth.uid(), 'empresarial'::public.user_role))
  );

-- user_departments
CREATE POLICY user_depts_select ON public.user_departments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.departments d
      WHERE d.id = department_id AND public.user_can_access_empresa(d.company_id)
    )
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.departments d
        WHERE d.id = department_id AND (
          public.has_role(auth.uid(), 'administrador'::public.user_role)
          OR public.user_is_department_admin(d.id)
        )
      )
    )
  );

CREATE POLICY user_depts_modify ON public.user_departments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.departments d
      WHERE d.id = department_id AND public.user_can_access_empresa(d.company_id)
    )
    AND (
      public.has_role(auth.uid(), 'administrador'::public.user_role)
      OR EXISTS (
        SELECT 1 FROM public.departments d
        WHERE d.id = department_id AND public.user_is_department_admin(d.id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.departments d
      WHERE d.id = department_id AND public.user_can_access_empresa(d.company_id)
    )
    AND (
      public.has_role(auth.uid(), 'administrador'::public.user_role)
      OR EXISTS (
        SELECT 1 FROM public.departments d
        WHERE d.id = department_id AND public.user_is_department_admin(d.id)
      )
    )
  );

-- department_assignments
CREATE POLICY dept_assign_select ON public.department_assignments
  FOR SELECT USING (
    public.user_can_access_empresa(company_id)
  );

CREATE POLICY dept_assign_modify ON public.department_assignments
  FOR ALL TO authenticated
  USING (
    public.user_can_access_empresa(company_id)
    AND (
      public.has_role(auth.uid(), 'administrador'::public.user_role)
      OR EXISTS (
        SELECT 1 FROM public.user_departments ud
        WHERE ud.department_id = department_id
          AND ud.user_id = auth.uid()
          AND ud.role_in_department = 'admin'
      )
    )
  )
  WITH CHECK (
    public.user_can_access_empresa(company_id)
    AND (
      public.has_role(auth.uid(), 'administrador'::public.user_role)
      OR EXISTS (
        SELECT 1 FROM public.user_departments ud
        WHERE ud.department_id = department_id
          AND ud.user_id = auth.uid()
          AND ud.role_in_department = 'admin'
      )
    )
  );

-- 4) RPC utilitárias
-- Atribuir departamentos a um recurso (sobrescreve os existentes)
CREATE OR REPLACE FUNCTION public.assign_departments_to_resource(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_company_id UUID,
  p_department_ids UUID[],
  p_primary_department_id UUID
) RETURNS VOID AS $$
DECLARE
  dept UUID;
BEGIN
  IF array_length(p_department_ids, 1) IS NULL OR array_length(p_department_ids, 1) < 1 THEN
    RAISE EXCEPTION 'É obrigatório informar ao menos 1 departamento';
  END IF;
  IF p_primary_department_id IS NULL THEN
    RAISE EXCEPTION 'Departamento principal é obrigatório';
  END IF;
  IF NOT (p_primary_department_id = ANY(p_department_ids)) THEN
    RAISE EXCEPTION 'Departamento principal deve estar dentro da lista';
  END IF;

  -- Remover atribuições anteriores
  DELETE FROM public.department_assignments
  WHERE resource_type = p_resource_type AND resource_id = p_resource_id;

  -- Inserir novas atribuições
  FOREACH dept IN ARRAY p_department_ids LOOP
    INSERT INTO public.department_assignments(resource_type, resource_id, department_id, is_primary, company_id)
    VALUES (p_resource_type, p_resource_id, dept, dept = p_primary_department_id, p_company_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retorna departamentos do usuário (com metadados) limitados a uma empresa opcional
CREATE OR REPLACE FUNCTION public.my_departments(p_company_id UUID DEFAULT NULL)
RETURNS TABLE(
  department_id UUID,
  company_id UUID,
  name TEXT,
  slug TEXT,
  color TEXT,
  business_unit TEXT,
  is_active BOOLEAN,
  role_in_department TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.company_id, d.name, d.slug, d.color, d.business_unit, d.is_active, ud.role_in_department, ud.is_primary
  FROM public.user_departments ud
  JOIN public.departments d ON d.id = ud.department_id
  WHERE ud.user_id = auth.uid()
    AND (p_company_id IS NULL OR d.company_id = p_company_id)
    AND public.user_can_access_empresa(d.company_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) Seeds e backfill
-- Criar departamentos padrão por empresa (se não existirem)
CREATE OR REPLACE FUNCTION public.seed_default_departments()
RETURNS VOID AS $$
DECLARE
  emp RECORD;
  dept_count INTEGER;
BEGIN
  FOR emp IN SELECT id FROM public.empresas LOOP
    SELECT COUNT(*) INTO dept_count FROM public.departments WHERE company_id = emp.id;
    IF dept_count = 0 THEN
      INSERT INTO public.departments(company_id, name, slug, color, business_unit) VALUES
        (emp.id, 'VENDAS', 'vendas', '#16a34a', 'xGROWTH'),
        (emp.id, 'COMPLIANCE', 'compliance', '#2563eb', 'Mrx Compliance'),
        (emp.id, 'JURIDICO', 'juridico', '#7c3aed', 'MR Advocacia'),
        (emp.id, 'OUVIDORIA', 'ouvidoria', '#0ea5e9', 'Ouve.ai'),
        (emp.id, 'COBRANÇA', 'cobranca', '#f97316', 'Debto'),
        (emp.id, 'ADMINISTRATIVO', 'administrativo', '#6b7280', 'Administrativo');
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Vincular todos os usuários a ADMINISTRATIVO nas empresas a que têm acesso (baseado em profiles.empresa_ids)
CREATE OR REPLACE FUNCTION public.backfill_user_departments_default()
RETURNS VOID AS $$
DECLARE
  prof RECORD;
  emp_id UUID;
  admin_dept UUID;
  is_admin BOOLEAN;
BEGIN
  FOR prof IN SELECT p.user_id, p.role, unnest(COALESCE(p.empresa_ids, '{}')) AS empresa_id FROM public.profiles p LOOP
    emp_id := prof.empresa_id;
    is_admin := (prof.role = 'administrador');
    SELECT d.id INTO admin_dept FROM public.departments d WHERE d.company_id = emp_id AND d.slug = 'administrativo' LIMIT 1;
    IF admin_dept IS NOT NULL THEN
      INSERT INTO public.user_departments(user_id, department_id, role_in_department, is_primary)
      VALUES (prof.user_id, admin_dept, CASE WHEN is_admin THEN 'admin' ELSE 'member' END, false)
      ON CONFLICT (user_id, department_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar seeds e backfills (tarefas não recebem vinculação automática de departamento)
SELECT public.seed_default_departments();
SELECT public.backfill_user_departments_default();

