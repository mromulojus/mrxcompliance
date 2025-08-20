-- Criar quadros departamentais para todas as empresas existentes
DO $$
DECLARE
    empresa_record RECORD;
BEGIN
    -- Loop através de todas as empresas ativas
    FOR empresa_record IN 
        SELECT id FROM public.empresas 
    LOOP
        -- Criar quadros departamentais para cada empresa
        PERFORM create_departmental_boards_for_empresa(empresa_record.id);
    END LOOP;
END $$;