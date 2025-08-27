-- Atualizar políticas RLS da tabela tarefas para resolver problemas de atualização

-- Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Usuários podem atualizar tarefas de suas empresas" ON public.tarefas;
DROP POLICY IF EXISTS "Usuários podem criar tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Usuários podem ver tarefas de suas empresas" ON public.tarefas;
DROP POLICY IF EXISTS "Usuários podem deletar tarefas que criaram" ON public.tarefas;

-- Criar políticas mais flexíveis e robustas

-- Política de SELECT: Usuários podem ver tarefas se tiverem acesso à empresa ou se forem criadores
CREATE POLICY "Users can view tasks" ON public.tarefas
FOR SELECT USING (
  -- Superusers e administradores podem ver tudo
  has_role(auth.uid(), 'superuser'::user_role) OR 
  has_role(auth.uid(), 'administrador'::user_role) OR
  -- Usuários podem ver tarefas de empresas que têm acesso
  (empresa_id IS NOT NULL AND user_can_access_empresa_data(empresa_id)) OR
  -- Usuários podem ver tarefas que criaram (mesmo sem empresa)
  created_by = auth.uid() OR
  -- Usuários podem ver tarefas onde são responsáveis
  responsavel_id = auth.uid() OR
  auth.uid() = ANY(responsavel_ids) OR
  -- Se a tarefa não tem empresa_id mas está em um board, verificar acesso ao board
  (empresa_id IS NULL AND board_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM boards b WHERE b.id = board_id AND 
    (b.is_public = true OR b.created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM board_permissions bp WHERE bp.board_id = b.id AND bp.user_id = auth.uid()
    ))
  ))
);

-- Política de INSERT: Usuários autenticados podem criar tarefas
CREATE POLICY "Users can create tasks" ON public.tarefas
FOR INSERT WITH CHECK (
  -- Usuário deve estar autenticado
  auth.uid() IS NOT NULL AND
  -- Usuário deve ser o criador
  created_by = auth.uid() AND
  (
    -- Superusers e administradores podem criar qualquer tarefa
    has_role(auth.uid(), 'superuser'::user_role) OR 
    has_role(auth.uid(), 'administrador'::user_role) OR
    -- Usuários podem criar tarefas para empresas que têm acesso
    (empresa_id IS NOT NULL AND user_can_access_empresa_data(empresa_id)) OR
    -- Usuários podem criar tarefas sem empresa (pessoais)
    empresa_id IS NULL OR
    -- Usuários podem criar tarefas em boards que têm acesso
    (board_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM boards b WHERE b.id = board_id AND 
      (b.is_public = true OR b.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM board_permissions bp WHERE bp.board_id = b.id AND bp.user_id = auth.uid()
      ))
    ))
  )
);

-- Política de UPDATE: Usuários podem atualizar tarefas com condições flexíveis
CREATE POLICY "Users can update tasks" ON public.tarefas
FOR UPDATE USING (
  -- Usuário deve estar autenticado
  auth.uid() IS NOT NULL AND
  (
    -- Superusers e administradores podem atualizar qualquer tarefa
    has_role(auth.uid(), 'superuser'::user_role) OR 
    has_role(auth.uid(), 'administrador'::user_role) OR
    -- Usuários podem atualizar tarefas que criaram
    created_by = auth.uid() OR
    -- Usuários podem atualizar tarefas onde são responsáveis
    responsavel_id = auth.uid() OR
    auth.uid() = ANY(responsavel_ids) OR
    -- Usuários podem atualizar tarefas de empresas que têm acesso
    (empresa_id IS NOT NULL AND user_can_access_empresa_data(empresa_id)) OR
    -- Usuários podem atualizar tarefas em boards que têm permissão
    (board_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM boards b WHERE b.id = board_id AND 
      (b.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM board_permissions bp 
        WHERE bp.board_id = b.id AND bp.user_id = auth.uid() AND bp.permission_level IN ('admin', 'editor')
      ))
    ))
  )
) WITH CHECK (
  -- As mesmas condições para o novo estado após update
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR 
    has_role(auth.uid(), 'administrador'::user_role) OR
    created_by = auth.uid() OR
    responsavel_id = auth.uid() OR
    auth.uid() = ANY(responsavel_ids) OR
    (empresa_id IS NOT NULL AND user_can_access_empresa_data(empresa_id)) OR
    (board_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM boards b WHERE b.id = board_id AND 
      (b.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM board_permissions bp 
        WHERE bp.board_id = b.id AND bp.user_id = auth.uid() AND bp.permission_level IN ('admin', 'editor')
      ))
    ))
  )
);

-- Política de DELETE: Usuários podem deletar tarefas que criaram ou têm permissão
CREATE POLICY "Users can delete tasks" ON public.tarefas
FOR DELETE USING (
  -- Usuário deve estar autenticado
  auth.uid() IS NOT NULL AND
  (
    -- Superusers e administradores podem deletar qualquer tarefa
    has_role(auth.uid(), 'superuser'::user_role) OR 
    has_role(auth.uid(), 'administrador'::user_role) OR
    -- Usuários podem deletar tarefas que criaram
    created_by = auth.uid() OR
    -- Usuários com permissão admin em boards podem deletar tarefas do board
    (board_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM boards b WHERE b.id = board_id AND 
      (b.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM board_permissions bp 
        WHERE bp.board_id = b.id AND bp.user_id = auth.uid() AND bp.permission_level = 'admin'
      ))
    ))
  )
);