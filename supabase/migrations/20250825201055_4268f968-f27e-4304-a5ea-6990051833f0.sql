-- Corrigir quadros duplicados
-- Primeiro, identifica e consolida quadros duplicados
WITH duplicate_boards AS (
  SELECT 
    b1.id as original_id,
    b2.id as duplicate_id,
    b1.name,
    b1.empresa_id
  FROM boards b1 
  JOIN boards b2 ON b1.name = b2.name AND b1.empresa_id = b2.empresa_id 
  WHERE b1.is_active = true AND b2.is_active = true AND b1.id < b2.id
)
-- Mover tarefas dos quadros duplicados para os originais
UPDATE tarefas 
SET board_id = (
  SELECT original_id FROM duplicate_boards 
  WHERE duplicate_id = tarefas.board_id
)
WHERE board_id IN (SELECT duplicate_id FROM duplicate_boards);

-- Desativar quadros duplicados
UPDATE boards 
SET is_active = false, updated_at = now()
WHERE id IN (
  WITH duplicate_boards AS (
    SELECT 
      b1.id as original_id,
      b2.id as duplicate_id,
      b1.name,
      b1.empresa_id
    FROM boards b1 
    JOIN boards b2 ON b1.name = b2.name AND b1.empresa_id = b2.empresa_id 
    WHERE b1.is_active = true AND b2.is_active = true AND b1.id < b2.id
  )
  SELECT duplicate_id FROM duplicate_boards
);