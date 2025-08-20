-- Primeiro, obter o board ADMINISTRATIVO
DO $$
DECLARE
    admin_board_id uuid;
    a_fazer_col_id uuid;
    em_andamento_col_id uuid;
    em_revisao_col_id uuid;
    concluido_col_id uuid;
    default_empresa_id uuid;
BEGIN
    -- Buscar o board ADMINISTRATIVO
    SELECT id INTO admin_board_id 
    FROM boards 
    WHERE name = 'ADMINISTRATIVO' 
    LIMIT 1;
    
    -- Se não existir, criar
    IF admin_board_id IS NULL THEN
        INSERT INTO boards (name, created_by, card_default)
        VALUES ('ADMINISTRATIVO', (SELECT user_id FROM profiles LIMIT 1), '{"prioridade": "media", "modulo_origem": "geral"}'::jsonb)
        RETURNING id INTO admin_board_id;
        
        -- Criar colunas padrão
        INSERT INTO board_columns (board_id, name, position) VALUES
        (admin_board_id, 'A Fazer', 0),
        (admin_board_id, 'Em Andamento', 1),
        (admin_board_id, 'Em Revisão', 2),
        (admin_board_id, 'Concluído', 3);
    END IF;
    
    -- Obter IDs das colunas
    SELECT id INTO a_fazer_col_id FROM board_columns WHERE board_id = admin_board_id AND position = 0;
    SELECT id INTO em_andamento_col_id FROM board_columns WHERE board_id = admin_board_id AND position = 1;
    SELECT id INTO em_revisao_col_id FROM board_columns WHERE board_id = admin_board_id AND position = 2;
    SELECT id INTO concluido_col_id FROM board_columns WHERE board_id = admin_board_id AND position = 3;
    
    -- Obter uma empresa padrão
    SELECT id INTO default_empresa_id FROM empresas LIMIT 1;
    
    -- Atualizar tarefas órfãs
    UPDATE tarefas 
    SET 
        board_id = admin_board_id,
        column_id = CASE 
            WHEN status = 'a_fazer' THEN a_fazer_col_id
            WHEN status = 'em_andamento' THEN em_andamento_col_id
            WHEN status = 'em_revisao' THEN em_revisao_col_id
            WHEN status = 'concluido' THEN concluido_col_id
            ELSE a_fazer_col_id
        END,
        empresa_id = COALESCE(empresa_id, default_empresa_id),
        updated_at = now()
    WHERE board_id IS NULL OR column_id IS NULL OR empresa_id IS NULL;
    
END $$;