-- Eliminar quadros duplicados mantendo apenas um de cada tipo
-- e migrando todas as tarefas associadas

-- Primeiro, criar uma tabela temporária com os quadros a manter (os mais antigos com tarefas)
WITH boards_to_keep AS (
  SELECT DISTINCT ON (name) 
    id,
    name,
    created_at
  FROM public.boards 
  WHERE is_active = true
  ORDER BY name, created_at ASC
),
boards_to_delete AS (
  SELECT b.id, b.name
  FROM public.boards b
  WHERE b.is_active = true
  AND b.id NOT IN (SELECT id FROM boards_to_keep)
)

-- Atualizar tarefas dos quadros duplicados para usar os quadros principais
UPDATE public.tarefas 
SET board_id = (
  SELECT btk.id 
  FROM boards_to_keep btk
  JOIN public.boards b_old ON b_old.id = tarefas.board_id
  WHERE btk.name = b_old.name
  LIMIT 1
)
WHERE board_id IN (SELECT id FROM boards_to_delete);

-- Atualizar as colunas das tarefas para a primeira coluna do novo quadro
WITH boards_to_keep AS (
  SELECT DISTINCT ON (name) 
    id,
    name
  FROM public.boards 
  WHERE is_active = true
  ORDER BY name, created_at ASC
)
UPDATE public.tarefas 
SET column_id = (
  SELECT bc.id 
  FROM public.board_columns bc
  JOIN boards_to_keep btk ON bc.board_id = btk.id
  JOIN public.boards b_old ON b_old.id = tarefas.board_id
  WHERE btk.name = b_old.name
  ORDER BY bc.position ASC
  LIMIT 1
)
WHERE board_id IN (
  SELECT btk.id FROM boards_to_keep btk
);

-- Remover permissões dos quadros duplicados
DELETE FROM public.board_permissions 
WHERE board_id IN (
  SELECT b.id
  FROM public.boards b
  WHERE b.is_active = true
  AND b.id NOT IN (
    SELECT DISTINCT ON (name) id
    FROM public.boards 
    WHERE is_active = true
    ORDER BY name, created_at ASC
  )
);

-- Remover colunas dos quadros duplicados
DELETE FROM public.board_columns 
WHERE board_id IN (
  SELECT b.id
  FROM public.boards b
  WHERE b.is_active = true
  AND b.id NOT IN (
    SELECT DISTINCT ON (name) id
    FROM public.boards 
    WHERE is_active = true
    ORDER BY name, created_at ASC
  )
);

-- Finalmente, remover os quadros duplicados
DELETE FROM public.boards 
WHERE is_active = true
AND id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.boards 
  WHERE is_active = true
  ORDER BY name, created_at ASC
);

-- Remover também quadros inativos duplicados do tipo "Geral"
DELETE FROM public.boards 
WHERE is_active = false
AND name = 'Geral';