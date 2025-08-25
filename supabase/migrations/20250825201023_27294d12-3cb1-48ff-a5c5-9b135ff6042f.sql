-- Consolidar quadros duplicados mantendo apenas os que têm dados
-- Mover tarefas dos quadros duplicados para os quadros principais
UPDATE tarefas 
SET board_id = (
  CASE 
    WHEN board_id IN (
      SELECT b2.id FROM boards b1 
      JOIN boards b2 ON b1.name = b2.name AND b1.empresa_id = b2.empresa_id 
      WHERE b1.is_active = true AND b2.is_active = true AND b1.id != b2.id
      AND NOT EXISTS (SELECT 1 FROM tarefas WHERE board_id = b1.id)
      AND EXISTS (SELECT 1 FROM tarefas WHERE board_id = b2.id)
    ) THEN (
      SELECT b2.id FROM boards b1 
      JOIN boards b2 ON b1.name = b2.name AND b1.empresa_id = b2.empresa_id 
      WHERE b1.board_id = tarefas.board_id AND b2.is_active = true 
      AND EXISTS (SELECT 1 FROM tarefas WHERE board_id = b2.id)
      LIMIT 1
    )
    ELSE board_id
  END
)
WHERE board_id IN (
  SELECT b1.id FROM boards b1 
  WHERE EXISTS (
    SELECT 1 FROM boards b2 
    WHERE b1.name = b2.name AND b1.empresa_id = b2.empresa_id 
    AND b1.id != b2.id AND b1.is_active = true AND b2.is_active = true
  )
);

-- Desativar quadros duplicados que ficaram vazios
UPDATE boards 
SET is_active = false, updated_at = now()
WHERE id IN (
  SELECT b1.id FROM boards b1 
  WHERE EXISTS (
    SELECT 1 FROM boards b2 
    WHERE b1.name = b2.name AND b1.empresa_id = b2.empresa_id 
    AND b1.id != b2.id AND b1.is_active = true AND b2.is_active = true
  )
  AND NOT EXISTS (SELECT 1 FROM tarefas WHERE board_id = b1.id)
  AND NOT EXISTS (SELECT 1 FROM board_columns WHERE board_id = b1.id AND name NOT IN ('A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'))
);