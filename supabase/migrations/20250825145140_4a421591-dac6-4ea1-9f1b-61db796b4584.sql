-- Corrigir as políticas RLS da tabela board_permissions para evitar recursão infinita

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view board permissions they have access to" ON public.board_permissions;
DROP POLICY IF EXISTS "Board admins can manage permissions" ON public.board_permissions;

-- Criar políticas mais simples sem recursão
CREATE POLICY "Users can view their own permissions" 
ON public.board_permissions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Board creators can manage permissions" 
ON public.board_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.boards 
    WHERE boards.id = board_permissions.board_id 
    AND boards.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage all permissions" 
ON public.board_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'administrador'::user_role));