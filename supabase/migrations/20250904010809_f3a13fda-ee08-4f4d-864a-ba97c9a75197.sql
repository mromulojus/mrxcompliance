-- Corrigir warnings de segurança - definir search_path nas funções

-- Recriar função create_departmental_boards_for_empresa com search_path correto
CREATE OR REPLACE FUNCTION public.create_departmental_boards_for_empresa(empresa_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    department_record RECORD;
    board_id uuid;
BEGIN
    -- Verificar se o usuário tem permissão para a empresa
    IF NOT public.user_can_access_empresa(empresa_uuid) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para acessar esta empresa';
    END IF;

    -- Criar boards para cada departamento da empresa
    FOR department_record IN 
        SELECT id, name, slug 
        FROM public.departments 
        WHERE company_id = empresa_uuid AND is_active = true
    LOOP
        -- Verificar se já existe um board para este departamento
        SELECT id INTO board_id
        FROM public.task_boards
        WHERE empresa_id = empresa_uuid 
        AND name = department_record.name;

        -- Se não existe, criar o board
        IF board_id IS NULL THEN
            INSERT INTO public.task_boards (name, empresa_id, created_by)
            VALUES (department_record.name, empresa_uuid, auth.uid())
            RETURNING id INTO board_id;

            -- Criar colunas padrão para o board
            INSERT INTO public.task_columns (board_id, name, order_index) VALUES
            (board_id, 'A Fazer', 0),
            (board_id, 'Em Andamento', 1),
            (board_id, 'Em Revisão', 2),
            (board_id, 'Concluído', 3);
        END IF;
    END LOOP;
END;
$$;

-- Recriar função reorder_tasks com search_path correto
CREATE OR REPLACE FUNCTION public.reorder_tasks(
    task_id uuid,
    new_status task_status,
    new_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar a tarefa com novo status e ordem
    UPDATE public.tarefas 
    SET 
        status = new_status,
        ordem_na_coluna = new_order,
        updated_at = now()
    WHERE id = task_id;
    
    -- Se não foi encontrada a tarefa, levantar erro
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tarefa não encontrada: %', task_id;
    END IF;
END;
$$;