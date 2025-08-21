-- Criar uma função temporária para debug que ignora RLS
CREATE OR REPLACE FUNCTION public.debug_colaboradores()
RETURNS TABLE(
  id uuid,
  nome text,
  empresa_id uuid,
  status colaborador_status,
  created_by uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.nome, c.empresa_id, c.status, c.created_by
  FROM colaboradores c
  ORDER BY c.nome;
$$;