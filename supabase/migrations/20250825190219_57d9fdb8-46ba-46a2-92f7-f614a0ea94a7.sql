-- Desativar o quadro duplicado (o mais recente que não tem tarefas nem colunas personalizadas)
UPDATE boards 
SET is_active = false, updated_at = now()
WHERE id = 'd1b58a72-3796-4ffb-bbd1-b4c06a38d0db';

-- Adicionar constraint para evitar duplicação de quadros com mesmo nome para mesma empresa
ALTER TABLE boards 
ADD CONSTRAINT unique_board_name_per_empresa 
UNIQUE (name, empresa_id, is_active) 
DEFERRABLE INITIALLY DEFERRED;