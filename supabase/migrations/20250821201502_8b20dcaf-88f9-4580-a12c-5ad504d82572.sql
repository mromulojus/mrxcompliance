-- Adicionar suporte a múltiplos responsáveis na tabela tarefas
ALTER TABLE public.tarefas 
ADD COLUMN responsavel_ids uuid[] DEFAULT ARRAY[]::uuid[];

-- Migrar dados existentes do responsavel_id para responsavel_ids
UPDATE public.tarefas 
SET responsavel_ids = ARRAY[responsavel_id]
WHERE responsavel_id IS NOT NULL;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_tarefas_responsavel_ids ON public.tarefas USING GIN(responsavel_ids);

-- Comentário explicativo
COMMENT ON COLUMN public.tarefas.responsavel_ids IS 'Array de UUIDs dos responsáveis pela tarefa. responsavel_id mantido para compatibilidade.';