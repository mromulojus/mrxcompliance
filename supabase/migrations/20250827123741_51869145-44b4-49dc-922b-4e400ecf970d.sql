-- Criar trigger para garantir que tarefas sempre tenham empresa_id válido
-- Este trigger será executado antes de INSERT/UPDATE em tarefas

CREATE OR REPLACE FUNCTION public.ensure_tarefa_empresa_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se empresa_id é nulo ou vazio, tentar obter do board
  IF NEW.empresa_id IS NULL AND NEW.board_id IS NOT NULL THEN
    SELECT empresa_id INTO NEW.empresa_id
    FROM public.boards
    WHERE id = NEW.board_id
    AND empresa_id IS NOT NULL;
    
    -- Log para debugging
    IF NEW.empresa_id IS NOT NULL THEN
      RAISE NOTICE 'Auto-assigned empresa_id % from board % to task %', NEW.empresa_id, NEW.board_id, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função antes de INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_ensure_tarefa_empresa_id ON public.tarefas;
CREATE TRIGGER trigger_ensure_tarefa_empresa_id
  BEFORE INSERT OR UPDATE ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_tarefa_empresa_id();

-- Atualizar tarefas existentes que não têm empresa_id mas têm board_id
UPDATE public.tarefas 
SET empresa_id = boards.empresa_id
FROM public.boards
WHERE tarefas.empresa_id IS NULL 
  AND tarefas.board_id IS NOT NULL 
  AND tarefas.board_id = boards.id 
  AND boards.empresa_id IS NOT NULL;