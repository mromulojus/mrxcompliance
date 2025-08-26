-- Fix tarefas with null empresa_id by setting them to the board's empresa_id
UPDATE public.tarefas 
SET empresa_id = (
  SELECT empresa_id 
  FROM public.boards 
  WHERE boards.id = tarefas.board_id
)
WHERE empresa_id IS NULL 
AND board_id IS NOT NULL;