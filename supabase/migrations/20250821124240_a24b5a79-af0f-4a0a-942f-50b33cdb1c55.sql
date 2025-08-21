-- Inserir dados de exemplo para agenda de acordos
-- Primeiro, buscar uma empresa existente
DO $$
DECLARE
    empresa_sample_id UUID;
BEGIN
    -- Pegar uma empresa existente
    SELECT id INTO empresa_sample_id FROM public.empresas LIMIT 1;
    
    IF empresa_sample_id IS NOT NULL THEN
        -- Inserir alguns acordos de exemplo
        INSERT INTO public.agenda_acordos (
            empresa_id, devedor_nome, parcela_numero, parcela_total, 
            valor_parcela, data_vencimento, status, observacoes
        ) VALUES 
        (empresa_sample_id, 'João Silva Santos', 3, 6, 1200.00, '2025-01-25', 'pendente', 'Acordo de parcelamento em 6x'),
        (empresa_sample_id, 'Maria Santos Oliveira', 1, 4, 800.00, '2025-01-28', 'pendente', 'Primeira parcela do acordo'),
        (empresa_sample_id, 'Carlos Lima Ferreira', 2, 8, 2500.00, '2025-02-02', 'pendente', 'Parcela 2 de 8 - valor negociado'),
        (empresa_sample_id, 'Ana Costa Rodrigues', 4, 5, 650.00, '2025-01-15', 'atrasado', 'Parcela em atraso - contatar urgente'),
        (empresa_sample_id, 'Pedro Almeida Junior', 1, 3, 1800.00, '2025-02-10', 'pendente', 'Acordo recente - monitorar pagamento');
        
        RAISE NOTICE 'Dados de exemplo inseridos com sucesso para empresa %', empresa_sample_id;
    ELSE
        RAISE NOTICE 'Nenhuma empresa encontrada para inserir dados de exemplo';
    END IF;
END $$;