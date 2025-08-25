-- Consolidar quadros duplicados
-- Primeiro, vamos mover todas as tarefas dos quadros duplicados para o mais antigo de cada grupo
WITH duplicated_boards AS (
  SELECT 
    b1.id as keep_id,
    b2.id as remove_id,
    b1.name,
    b1.empresa_id,
    b1.created_at as keep_created,
    b2.created_at as remove_created
  FROM boards b1
  JOIN boards b2 ON b1.name = b2.name 
    AND b1.empresa_id = b2.empresa_id 
    AND b1.is_active = true 
    AND b2.is_active = true
    AND b1.id != b2.id
    AND b1.created_at < b2.created_at  -- manter o mais antigo
),
tasks_to_move AS (
  SELECT 
    t.id as task_id,
    t.board_id as old_board_id,
    db.keep_id as new_board_id,
    -- Encontrar a primeira coluna do quadro de destino
    (SELECT bc.id FROM board_columns bc WHERE bc.board_id = db.keep_id ORDER BY bc.position LIMIT 1) as new_column_id
  FROM tarefas t
  JOIN duplicated_boards db ON t.board_id = db.remove_id
)
-- Mover tarefas para o quadro consolidado
UPDATE tarefas 
SET board_id = tasks_to_move.new_board_id,
    column_id = tasks_to_move.new_column_id,
    updated_at = now()
FROM tasks_to_move
WHERE tarefas.id = tasks_to_move.task_id;

-- Desativar quadros duplicados
UPDATE boards 
SET is_active = false, updated_at = now()
FROM (
  SELECT b2.id
  FROM boards b1
  JOIN boards b2 ON b1.name = b2.name 
    AND b1.empresa_id = b2.empresa_id 
    AND b1.is_active = true 
    AND b2.is_active = true
    AND b1.id != b2.id
    AND b1.created_at < b2.created_at  -- remover os mais novos
) duplicates
WHERE boards.id = duplicates.id;

-- Criar índice único para prevenir futuras duplicações
CREATE UNIQUE INDEX IF NOT EXISTS idx_boards_unique_active 
ON boards (name, empresa_id) 
WHERE is_active = true;

-- Adicionar comentário explicativo
COMMENT ON INDEX idx_boards_unique_active IS 'Previne criação de quadros duplicados com mesmo nome para a mesma empresa';