-- Tabela de Quadros (Boards) com vínculo a Departamentos via department_assignments

-- Tipicamente aproveitamos a função pública update_updated_at_column já existente

CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boards_empresa ON public.boards(empresa_id);
CREATE INDEX idx_boards_active ON public.boards(is_active);

-- Trigger para manter updated_at
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Leitura: precisa ter acesso à empresa e pertencer a algum departamento do quadro
CREATE POLICY boards_select ON public.boards
FOR SELECT USING (
  public.user_can_access_empresa_data(empresa_id)
  AND public.resource_visible_by_user('boards', id, empresa_id)
);

-- Criação: usuário deve ter acesso à empresa; o vínculo de departamento ocorre via trigger abaixo
CREATE POLICY boards_insert ON public.boards
FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_access_empresa_data(empresa_id)
  AND created_by = auth.uid()
);

-- Update: requer acesso à empresa; granularidade adicional pode ser adicionada conforme necessidade
CREATE POLICY boards_update ON public.boards
FOR UPDATE TO authenticated
USING (public.user_can_access_empresa_data(empresa_id));

-- Delete: autor ou admin
CREATE POLICY boards_delete ON public.boards
FOR DELETE TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'administrador'::public.user_role));

-- Trigger: ao criar um board, vincular ao departamento principal do criador nessa empresa
CREATE OR REPLACE FUNCTION public.auto_assign_department_on_board_insert()
RETURNS TRIGGER AS $$
DECLARE
  primary_dept UUID;
  admin_dept UUID;
BEGIN
  IF NEW.empresa_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ud.department_id INTO primary_dept
  FROM public.user_departments ud
  JOIN public.departments d ON d.id = ud.department_id
  WHERE ud.user_id = NEW.created_by AND d.company_id = NEW.empresa_id AND ud.is_primary = true
  LIMIT 1;

  IF primary_dept IS NOT NULL THEN
    INSERT INTO public.department_assignments(resource_type, resource_id, department_id, is_primary, company_id)
    VALUES ('boards', NEW.id, primary_dept, true, NEW.empresa_id)
    ON CONFLICT DO NOTHING;
  ELSE
    SELECT d.id INTO admin_dept FROM public.departments d WHERE d.company_id = NEW.empresa_id AND d.slug = 'administrativo' LIMIT 1;
    IF admin_dept IS NOT NULL THEN
      INSERT INTO public.department_assignments(resource_type, resource_id, department_id, is_primary, company_id)
      VALUES ('boards', NEW.id, admin_dept, true, NEW.empresa_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_board_auto_assign_department
AFTER INSERT ON public.boards
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_department_on_board_insert();

