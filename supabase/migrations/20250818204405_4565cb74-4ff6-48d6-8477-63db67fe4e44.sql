-- Criar tabela de tarefas para o módulo Kanban
CREATE TYPE task_status AS ENUM ('a_fazer', 'em_andamento', 'em_revisao', 'concluido');
CREATE TYPE task_priority AS ENUM ('alta', 'media', 'baixa');
CREATE TYPE task_module AS ENUM ('ouvidoria', 'auditoria', 'cobrancas', 'geral');

CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status task_status NOT NULL DEFAULT 'a_fazer',
  prioridade task_priority NOT NULL DEFAULT 'media',
  modulo_origem task_module NOT NULL DEFAULT 'geral',
  empresa_id UUID REFERENCES public.empresas(id),
  responsavel_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  data_vencimento DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  ordem_na_coluna INTEGER DEFAULT 0,
  
  -- Vinculações com outros módulos
  denuncia_id UUID REFERENCES public.denuncias(id),
  divida_id UUID REFERENCES public.dividas(id),
  colaborador_id UUID REFERENCES public.colaboradores(id),
  processo_id UUID REFERENCES public.processos_judiciais(id),
  
  -- Anexos (URLs do Supabase Storage)
  anexos TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver tarefas de suas empresas" 
ON public.tarefas 
FOR SELECT 
USING (user_can_access_empresa_data(empresa_id));

CREATE POLICY "Usuários podem criar tarefas" 
ON public.tarefas 
FOR INSERT 
WITH CHECK (
  user_can_access_empresa_data(empresa_id) AND
  created_by = auth.uid()
);

CREATE POLICY "Usuários podem atualizar tarefas de suas empresas" 
ON public.tarefas 
FOR UPDATE 
USING (user_can_access_empresa_data(empresa_id));

CREATE POLICY "Usuários podem deletar tarefas que criaram" 
ON public.tarefas 
FOR DELETE 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'administrador'::user_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON public.tarefas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_tarefas_empresa_id ON public.tarefas(empresa_id);
CREATE INDEX idx_tarefas_responsavel ON public.tarefas(responsavel_id);
CREATE INDEX idx_tarefas_status ON public.tarefas(status);
CREATE INDEX idx_tarefas_modulo ON public.tarefas(modulo_origem);
CREATE INDEX idx_tarefas_vencimento ON public.tarefas(data_vencimento);

-- Função para reordenar tarefas na mesma coluna
CREATE OR REPLACE FUNCTION reorder_tasks_in_column(
  p_task_id UUID,
  p_new_status task_status,
  p_new_order INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Atualizar a tarefa movida
  UPDATE public.tarefas 
  SET 
    status = p_new_status,
    ordem_na_coluna = p_new_order,
    updated_at = now()
  WHERE id = p_task_id;
  
  -- Reordenar outras tarefas na mesma empresa e status
  UPDATE public.tarefas 
  SET 
    ordem_na_coluna = ordem_na_coluna + 1,
    updated_at = now()
  WHERE 
    empresa_id = (SELECT empresa_id FROM public.tarefas WHERE id = p_task_id)
    AND status = p_new_status 
    AND id != p_task_id 
    AND ordem_na_coluna >= p_new_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;