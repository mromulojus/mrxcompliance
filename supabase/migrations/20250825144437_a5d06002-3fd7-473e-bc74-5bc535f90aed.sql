-- ETAPA 1: Limpeza e migração de dados + ETAPA 2: Estrutura de módulos + ETAPA 3: Sistema de permissões + ETAPA 4: Personalização visual

-- Criar enum para módulos
CREATE TYPE public.board_module AS ENUM (
  'vendas',
  'compliance', 
  'juridico',
  'ouvidoria',
  'cobranca',
  'administrativo',
  'geral'
);

-- Adicionar campos na tabela boards
ALTER TABLE public.boards 
ADD COLUMN IF NOT EXISTS modulos board_module[] DEFAULT ARRAY['geral'::board_module],
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS background_image TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Criar tabela de permissões de quadros
CREATE TABLE IF NOT EXISTS public.board_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Enable RLS on board_permissions
ALTER TABLE public.board_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for board_permissions
CREATE POLICY "Users can view board permissions they have access to" 
ON public.board_permissions 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.board_permissions bp2 
    WHERE bp2.board_id = board_permissions.board_id 
    AND bp2.user_id = auth.uid() 
    AND bp2.permission_level IN ('edit', 'admin')
  )
);

CREATE POLICY "Board admins can manage permissions" 
ON public.board_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.board_permissions bp 
    WHERE bp.board_id = board_permissions.board_id 
    AND bp.user_id = auth.uid() 
    AND bp.permission_level = 'admin'
  )
);

-- Update boards RLS policy to include permissions
DROP POLICY IF EXISTS "Users can view boards they have access to" ON public.boards;
CREATE POLICY "Users can view boards they have access to" 
ON public.boards 
FOR SELECT 
USING (
  is_public = true OR
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.board_permissions bp 
    WHERE bp.board_id = boards.id 
    AND bp.user_id = auth.uid()
  )
);

-- MIGRAÇÃO DE DADOS: Transferir tarefas de quadros "Geral" para "ADMINISTRATIVO"
DO $$
DECLARE
    empresa_rec RECORD;
    geral_board_id UUID;
    admin_board_id UUID;
BEGIN
    -- Para cada empresa
    FOR empresa_rec IN 
        SELECT id FROM empresas 
    LOOP
        -- Encontrar quadro "Geral" da empresa
        SELECT id INTO geral_board_id 
        FROM boards 
        WHERE empresa_id = empresa_rec.id 
        AND name = 'Geral' 
        AND is_active = true 
        LIMIT 1;
        
        -- Encontrar quadro "ADMINISTRATIVO" da empresa
        SELECT id INTO admin_board_id 
        FROM boards 
        WHERE empresa_id = empresa_rec.id 
        AND name = 'ADMINISTRATIVO' 
        AND is_active = true 
        LIMIT 1;
        
        -- Se ambos existem, transferir tarefas
        IF geral_board_id IS NOT NULL AND admin_board_id IS NOT NULL THEN
            -- Transferir tarefas do quadro Geral para ADMINISTRATIVO
            UPDATE public.tarefas 
            SET board_id = admin_board_id,
                updated_at = now()
            WHERE board_id = geral_board_id;
            
            -- Desativar o quadro Geral
            UPDATE public.boards 
            SET is_active = false,
                updated_at = now()
            WHERE id = geral_board_id;
        END IF;
        
        -- Resetar variáveis
        geral_board_id := NULL;
        admin_board_id := NULL;
    END LOOP;
END $$;

-- Atualizar quadros existentes com módulos apropriados
UPDATE public.boards 
SET modulos = CASE 
    WHEN name ILIKE '%VENDAS%' OR name ILIKE '%xGROWTH%' THEN ARRAY['vendas'::board_module]
    WHEN name ILIKE '%COMPLIANCE%' OR name ILIKE '%Mrx%' THEN ARRAY['compliance'::board_module]
    WHEN name ILIKE '%JURIDICO%' OR name ILIKE '%MR Advocacia%' THEN ARRAY['juridico'::board_module]
    WHEN name ILIKE '%OUVIDORIA%' OR name ILIKE '%Ouve%' THEN ARRAY['ouvidoria'::board_module]
    WHEN name ILIKE '%COBRANÇA%' OR name ILIKE '%Debto%' THEN ARRAY['cobranca'::board_module]
    WHEN name ILIKE '%ADMINISTRATIVO%' THEN ARRAY['administrativo'::board_module]
    ELSE ARRAY['geral'::board_module]
END,
updated_at = now();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_board_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_board_permissions_updated_at
  BEFORE UPDATE ON public.board_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_board_permissions_updated_at();

-- Atualizar função de criação de quadros departamentais para não criar "Geral"
CREATE OR REPLACE FUNCTION public.create_departmental_boards_for_empresa(p_empresa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  dept_board_id uuid;
  dept_configs JSONB[] := ARRAY[
    '{"name": "VENDAS (xGROWTH)", "modulos": ["vendas"], "color": "#10B981"}'::jsonb,
    '{"name": "COMPLIANCE (Mrx Compliance)", "modulos": ["compliance"], "color": "#3B82F6"}'::jsonb,
    '{"name": "JURIDICO (MR Advocacia)", "modulos": ["juridico"], "color": "#8B5CF6"}'::jsonb,
    '{"name": "OUVIDORIA (Ouve.ai)", "modulos": ["ouvidoria"], "color": "#F59E0B"}'::jsonb,
    '{"name": "COBRANÇA (Debto)", "modulos": ["cobranca"], "color": "#EF4444"}'::jsonb,
    '{"name": "ADMINISTRATIVO", "modulos": ["administrativo"], "color": "#6B7280"}'::jsonb
  ];
  dept_config JSONB;
BEGIN
  FOREACH dept_config IN ARRAY dept_configs
  LOOP
    -- Verificar se o quadro já existe
    IF NOT EXISTS (
      SELECT 1 FROM public.boards 
      WHERE empresa_id = p_empresa_id 
      AND name = (dept_config->>'name')
      AND is_active = true
    ) THEN
      -- Criar o quadro departamental
      INSERT INTO public.boards (name, empresa_id, created_by, modulos, background_color, is_public)
      VALUES (
        dept_config->>'name', 
        p_empresa_id, 
        auth.uid(),
        ARRAY((SELECT jsonb_array_elements_text(dept_config->'modulos')))::board_module[],
        dept_config->>'color',
        false
      )
      RETURNING id INTO dept_board_id;
      
      -- Criar colunas padrão para o quadro
      INSERT INTO public.board_columns (board_id, name, position) VALUES
      (dept_board_id, 'A Fazer', 0),
      (dept_board_id, 'Em Andamento', 1),
      (dept_board_id, 'Em Revisão', 2),
      (dept_board_id, 'Concluído', 3);
      
      -- Dar permissão admin ao criador
      INSERT INTO public.board_permissions (board_id, user_id, permission_level)
      VALUES (dept_board_id, auth.uid(), 'admin');
    END IF;
  END LOOP;
END;
$function$;