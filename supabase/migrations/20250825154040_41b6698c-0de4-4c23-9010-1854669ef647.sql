-- Verificar e corrigir constraints da tabela tarefas
-- Remover constraint NOT NULL de board_id e column_id temporariamente
-- para permitir criação de tarefas durante migração

-- Tornar board_id e column_id opcionais para criação de tarefas
ALTER TABLE public.tarefas 
ALTER COLUMN board_id DROP NOT NULL,
ALTER COLUMN column_id DROP NOT NULL;

-- Criar trigger para atribuir board/column baseado no módulo quando não especificado
CREATE OR REPLACE FUNCTION auto_assign_board_column()
RETURNS TRIGGER AS $$
DECLARE
  target_board_id uuid;
  first_column_id uuid;
  board_name text;
BEGIN
  -- Se board_id já foi especificado, não fazer nada
  IF NEW.board_id IS NOT NULL AND NEW.column_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Determinar nome do board baseado no módulo
  CASE NEW.modulo_origem
    WHEN 'vendas' THEN board_name := 'Vendas';
    WHEN 'compliance' THEN board_name := 'Compliance';
    WHEN 'juridico' THEN board_name := 'Jurídico';
    WHEN 'ouvidoria' THEN board_name := 'Ouvidoria';
    WHEN 'cobrancas' THEN board_name := 'Cobranças';
    ELSE board_name := 'Administrativo';
  END CASE;
  
  -- Buscar board correspondente
  SELECT id INTO target_board_id
  FROM public.boards
  WHERE name ILIKE '%' || board_name || '%' 
  AND is_active = true
  LIMIT 1;
  
  -- Se não encontrou board específico, usar primeiro board ativo
  IF target_board_id IS NULL THEN
    SELECT id INTO target_board_id
    FROM public.boards
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Buscar primeira coluna do board
  IF target_board_id IS NOT NULL THEN
    SELECT id INTO first_column_id
    FROM public.board_columns
    WHERE board_id = target_board_id
    ORDER BY position ASC
    LIMIT 1;
    
    -- Atribuir board e coluna
    NEW.board_id := target_board_id;
    NEW.column_id := first_column_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_board_column ON public.tarefas;
CREATE TRIGGER trigger_auto_assign_board_column
  BEFORE INSERT ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_board_column();