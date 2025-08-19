-- Multi-assignees for tarefas and stricter visibility rules

-- 1) Create join table tarefa_responsaveis
CREATE TABLE IF NOT EXISTS public.tarefa_responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tarefa_id, user_id)
);

ALTER TABLE public.tarefa_responsaveis ENABLE ROW LEVEL SECURITY;

-- Policies for tarefa_responsaveis
DROP POLICY IF EXISTS "select_tarefa_responsaveis" ON public.tarefa_responsaveis;
CREATE POLICY "select_tarefa_responsaveis"
ON public.tarefa_responsaveis
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'administrador'::public.user_role)
  OR public.has_role(auth.uid(), 'superuser'::public.user_role)
);

DROP POLICY IF EXISTS "insert_tarefa_responsaveis" ON public.tarefa_responsaveis;
CREATE POLICY "insert_tarefa_responsaveis"
ON public.tarefa_responsaveis
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'administrador'::public.user_role)
  OR public.has_role(auth.uid(), 'superuser'::public.user_role)
);

DROP POLICY IF EXISTS "delete_tarefa_responsaveis" ON public.tarefa_responsaveis;
CREATE POLICY "delete_tarefa_responsaveis"
ON public.tarefa_responsaveis
FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'administrador'::public.user_role)
  OR public.has_role(auth.uid(), 'superuser'::public.user_role)
);

CREATE INDEX IF NOT EXISTS idx_tarefa_responsaveis_tarefa ON public.tarefa_responsaveis(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_responsaveis_user ON public.tarefa_responsaveis(user_id);

-- 2) Restrict tarefas visibility: only superuser sees all, others see only tasks assigned to them
DO $$
BEGIN
  -- Drop old company-based select policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'tarefas' 
      AND policyname = 'Usuários podem ver tarefas de suas empresas'
  ) THEN
    DROP POLICY "Usuários podem ver tarefas de suas empresas" ON public.tarefas;
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Usuários veem apenas tarefas atribuídas"
ON public.tarefas
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'superuser'::public.user_role)
  OR EXISTS (
    SELECT 1 FROM public.tarefa_responsaveis tr
    WHERE tr.tarefa_id = id AND tr.user_id = auth.uid()
  )
);

