-- Atualizar função para prevenir criação de quadros duplicados
CREATE OR REPLACE FUNCTION public.create_departmental_boards_for_empresa(p_empresa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    -- Verificar se o quadro já existe (incluindo ativos e inativos)
    IF NOT EXISTS (
      SELECT 1 FROM public.boards 
      WHERE empresa_id = p_empresa_id 
      AND name = (dept_config->>'name')
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
    ELSE
      -- Se existe mas está inativo, reativar
      UPDATE public.boards 
      SET is_active = true, updated_at = now()
      WHERE empresa_id = p_empresa_id 
      AND name = (dept_config->>'name')
      AND is_active = false;
    END IF;
  END LOOP;
END;
$function$;