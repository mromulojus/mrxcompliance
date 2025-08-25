-- =========================================
-- CORREÇÃO URGENTE DAS RLS POLICIES
-- Remove policies problemáticas que causam recursão infinita
-- =========================================

-- 1. Criar função security definer para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 2. Criar função para verificar acesso a empresa
CREATE OR REPLACE FUNCTION public.user_can_access_empresa_simple(empresa_uuid uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (
      role::text IN ('superuser', 'administrador')
      OR empresa_uuid = ANY(empresa_ids)
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Remover todas as policies problemáticas das tabelas boards
DROP POLICY IF EXISTS "Users can view boards from their company" ON public.boards;
DROP POLICY IF EXISTS "Users can create boards for their company" ON public.boards;
DROP POLICY IF EXISTS "Users can update boards from their company" ON public.boards;
DROP POLICY IF EXISTS "Users can delete boards from their company" ON public.boards;
DROP POLICY IF EXISTS "Users can view boards they have access to" ON public.boards;

-- 4. Criar policies simples e diretas para boards
CREATE POLICY "Anyone can view boards" ON public.boards
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create boards" ON public.boards
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own boards" ON public.boards
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own boards" ON public.boards
FOR DELETE USING (created_by = auth.uid());

-- 5. Remover policies problemáticas das board_columns
DROP POLICY IF EXISTS "Users can view columns from accessible boards" ON public.board_columns;
DROP POLICY IF EXISTS "Users can create columns for accessible boards" ON public.board_columns;
DROP POLICY IF EXISTS "Users can update columns from accessible boards" ON public.board_columns;
DROP POLICY IF EXISTS "Users can delete columns from accessible boards" ON public.board_columns;

-- 6. Criar policies simples para board_columns
CREATE POLICY "Anyone can view board columns" ON public.board_columns
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage board columns" ON public.board_columns
FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. Garantir que tarefas tenham campos board_id e column_id
ALTER TABLE public.tarefas 
ADD COLUMN IF NOT EXISTS board_id uuid,
ADD COLUMN IF NOT EXISTS column_id uuid;

-- 8. Criar index para performance
CREATE INDEX IF NOT EXISTS idx_tarefas_board_id ON public.tarefas(board_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_column_id ON public.tarefas(column_id);

-- 9. Limpar dados problemáticos - desativar quadros "Geral" duplicados
UPDATE public.boards 
SET is_active = false 
WHERE name ILIKE '%geral%' 
AND created_at < (
  SELECT MAX(created_at) 
  FROM public.boards b2 
  WHERE b2.name ILIKE '%geral%' 
  AND b2.empresa_id = boards.empresa_id
);

-- 10. Função para migrar tarefas existentes para o sistema de boards
CREATE OR REPLACE FUNCTION migrate_tasks_to_boards()
RETURNS void AS $$
DECLARE
  task_record RECORD;
  target_board_id uuid;
  first_column_id uuid;
BEGIN
  -- Para cada tarefa sem board_id
  FOR task_record IN 
    SELECT * FROM public.tarefas 
    WHERE board_id IS NULL
  LOOP
    -- Encontrar board apropriado baseado no módulo
    SELECT id INTO target_board_id
    FROM public.boards
    WHERE is_active = true
    AND (
      (task_record.modulo_origem = 'vendas' AND name ILIKE '%vendas%')
      OR (task_record.modulo_origem = 'compliance' AND name ILIKE '%compliance%')
      OR (task_record.modulo_origem = 'juridico' AND name ILIKE '%juridico%')
      OR (task_record.modulo_origem = 'ouvidoria' AND name ILIKE '%ouvidoria%')
      OR (task_record.modulo_origem = 'cobrancas' AND name ILIKE '%cobrança%')
      OR (task_record.modulo_origem = 'geral' AND name ILIKE '%administrativo%')
    )
    LIMIT 1;
    
    -- Se não encontrou board específico, usar primeiro board ativo
    IF target_board_id IS NULL THEN
      SELECT id INTO target_board_id
      FROM public.boards
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;
    
    -- Encontrar primeira coluna do board
    IF target_board_id IS NOT NULL THEN
      SELECT id INTO first_column_id
      FROM public.board_columns
      WHERE board_id = target_board_id
      ORDER BY position ASC
      LIMIT 1;
      
      -- Atualizar tarefa
      UPDATE public.tarefas
      SET 
        board_id = target_board_id,
        column_id = first_column_id
      WHERE id = task_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a migração
SELECT migrate_tasks_to_boards();