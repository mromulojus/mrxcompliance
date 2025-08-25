-- Create default "General" board for all companies that don't have one
DO $$
DECLARE
    empresa_rec RECORD;
    board_exists BOOLEAN;
BEGIN
    -- Loop through all companies
    FOR empresa_rec IN 
        SELECT id, nome FROM empresas 
    LOOP
        -- Check if company already has a "General" or "ADMINISTRATIVO" board
        SELECT EXISTS(
            SELECT 1 FROM boards 
            WHERE empresa_id = empresa_rec.id 
            AND (name = 'General' OR name = 'ADMINISTRATIVO' OR name = 'Geral')
            AND is_active = true
        ) INTO board_exists;
        
        -- If no general board exists, create one
        IF NOT board_exists THEN
            INSERT INTO boards (name, empresa_id, is_active, created_at, updated_at)
            VALUES ('Geral', empresa_rec.id, true, now(), now());
            
            -- Get the ID of the newly created board
            DECLARE
                new_board_id UUID;
            BEGIN
                SELECT id INTO new_board_id FROM boards 
                WHERE empresa_id = empresa_rec.id AND name = 'Geral' 
                ORDER BY created_at DESC LIMIT 1;
                
                -- Create default columns for the General board
                INSERT INTO board_columns (board_id, name, position, created_at, updated_at) VALUES
                (new_board_id, 'A Fazer', 0, now(), now()),
                (new_board_id, 'Em Andamento', 1, now(), now()),
                (new_board_id, 'Em Revisão', 2, now(), now()),
                (new_board_id, 'Concluído', 3, now(), now());
            END;
        END IF;
    END LOOP;
END $$;