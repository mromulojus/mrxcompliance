-- Limpar quadros duplicados de forma mais agressiva
-- Primeiro, consolidar todas as tarefas no quadro mais antigo de cada grupo
WITH board_ranking AS (
  SELECT 
    id,
    name,
    empresa_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY name, empresa_id, is_active ORDER BY created_at ASC) as rank_num,
    COUNT(*) OVER (PARTITION BY name, empresa_id, is_active) as total_count
  FROM boards 
  WHERE is_active = true
),
keep_boards AS (
  SELECT id as keep_board_id, name, empresa_id
  FROM board_ranking 
  WHERE rank_num = 1 AND total_count > 1
),
remove_boards AS (
  SELECT id as remove_board_id, name, empresa_id
  FROM board_ranking 
  WHERE rank_num > 1
),
tasks_to_consolidate AS (
  SELECT 
    t.id as task_id,
    t.board_id as current_board_id,
    kb.keep_board_id as target_board_id,
    -- Pegar primeira coluna do board de destino
    (SELECT bc.id FROM board_columns bc WHERE bc.board_id = kb.keep_board_id ORDER BY bc.position LIMIT 1) as target_column_id
  FROM tarefas t
  JOIN remove_boards rb ON t.board_id = rb.remove_board_id  
  JOIN keep_boards kb ON rb.name = kb.name AND rb.empresa_id = kb.empresa_id
)
-- Mover todas as tarefas para os quadros consolidados
UPDATE tarefas 
SET 
  board_id = ttc.target_board_id,
  column_id = ttc.target_column_id,
  updated_at = now()
FROM tasks_to_consolidate ttc
WHERE tarefas.id = ttc.task_id;

-- Agora desativar todos os quadros duplicados vazios
WITH board_ranking AS (
  SELECT 
    id,
    name,
    empresa_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY name, empresa_id, is_active ORDER BY created_at ASC) as rank_num,
    COUNT(*) OVER (PARTITION BY name, empresa_id, is_active) as total_count
  FROM boards 
  WHERE is_active = true
)
UPDATE boards 
SET is_active = false, updated_at = now()
WHERE id IN (
  SELECT id 
  FROM board_ranking 
  WHERE rank_num > 1 AND total_count > 1
);

-- Verificar se o índice único existe e recriar se necessário
DROP INDEX IF EXISTS idx_boards_unique_active;
CREATE UNIQUE INDEX idx_boards_unique_active 
ON boards (name, empresa_id) 
WHERE is_active = true;