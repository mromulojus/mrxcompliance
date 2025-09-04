-- Corrigir problemas de schema para resolver falhas nas PRs

-- 1. Adicionar "vendas" e outros valores em falta ao enum task_module
ALTER TYPE task_module ADD VALUE IF NOT EXISTS 'vendas';
ALTER TYPE task_module ADD VALUE IF NOT EXISTS 'juridico';
ALTER TYPE task_module ADD VALUE IF NOT EXISTS 'compliance';

-- 2. Adicionar coluna is_archived na tabela tarefas se não existir
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- 3. Criar função RPC para criar boards departamentais
CREATE OR REPLACE FUNCTION public.create_departmental_boards_for_empresa(empresa_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 4. Criar função para reordenar tarefas se não existir
CREATE OR REPLACE FUNCTION public.reorder_tasks(
    task_id uuid,
    new_status task_status,
    new_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 5. Corrigir políticas de task_boards para permitir UPDATE e DELETE
DROP POLICY IF EXISTS "Usuários podem criar task boards" ON public.task_boards;
DROP POLICY IF EXISTS "Usuários podem ver task boards da sua empresa" ON public.task_boards;

CREATE POLICY "Usuários podem gerenciar task boards da sua empresa" ON public.task_boards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

-- 6. Corrigir políticas de task_columns para permitir INSERT, UPDATE e DELETE
DROP POLICY IF EXISTS "Usuários podem ver colunas dos seus boards" ON public.task_columns;

CREATE POLICY "Usuários podem gerenciar colunas dos seus boards" ON public.task_columns
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.task_boards tb
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE tb.id = task_columns.board_id
    AND (p.role IN ('superuser', 'administrador') OR tb.empresa_id = ANY(p.empresa_ids))
  )
);

-- 7. Corrigir políticas de board_columns para permitir INSERT, UPDATE e DELETE
DROP POLICY IF EXISTS "Usuários podem ver board columns" ON public.board_columns;

CREATE POLICY "Usuários podem gerenciar board columns" ON public.board_columns
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.boards b
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE b.id = board_columns.board_id
    AND (p.role IN ('superuser', 'administrador') OR b.empresa_id = ANY(p.empresa_ids))
  )
);

-- 8. Permitir operações em outras tabelas necessárias
CREATE POLICY "Usuários podem gerenciar etiquetas templates" ON public.etiquetas_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Usuários podem gerenciar departamentos" ON public.departments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR company_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Usuários podem gerenciar documentos de colaborador" ON public.documentos_colaborador
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.colaboradores c
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE c.id = documentos_colaborador.colaborador_id
    AND (p.role IN ('superuser', 'administrador') OR c.empresa_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Usuários podem gerenciar eventos do calendário" ON public.calendario_eventos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Usuários podem gerenciar processos judiciais" ON public.processos_judiciais
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Admins podem gerenciar activity logs" ON public.activity_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('superuser', 'administrador')
  )
);

CREATE POLICY "Usuários podem gerenciar seus timesheets" ON public.user_timesheets
FOR ALL USING (user_id = auth.uid());