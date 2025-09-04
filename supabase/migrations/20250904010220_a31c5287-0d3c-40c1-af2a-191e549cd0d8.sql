-- Migration para sincronizar estrutura e corrigir problemas de RLS
-- Esta migration resolve os problemas que estavam causando falhas nas PRs

-- Habilitar RLS nas tabelas que estão expostas
ALTER TABLE public.acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendario_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_denuncia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_divida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_cobranca_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_judiciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_timesheets ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas de segurança para as tabelas principais
-- Acordos - usuários podem ver acordos da sua empresa
CREATE POLICY "Usuários podem ver acordos da sua empresa" ON public.acordos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dividas d
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE d.id = acordos.divida_id 
    AND (p.role IN ('superuser', 'administrador') OR d.empresa_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Usuários podem criar acordos" ON public.acordos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dividas d
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE d.id = divida_id 
    AND (p.role IN ('superuser', 'administrador') OR d.empresa_id = ANY(p.empresa_ids))
  )
);

-- Task boards - usuários podem ver boards da sua empresa
CREATE POLICY "Usuários podem ver task boards da sua empresa" ON public.task_boards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

CREATE POLICY "Usuários podem criar task boards" ON public.task_boards
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND created_by = auth.uid()
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

-- Task columns - usuários podem ver colunas dos boards que têm acesso
CREATE POLICY "Usuários podem ver colunas dos seus boards" ON public.task_columns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.task_boards tb
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE tb.id = task_columns.board_id
    AND (p.role IN ('superuser', 'administrador') OR tb.empresa_id = ANY(p.empresa_ids))
  )
);

-- Board columns - similar às task columns
CREATE POLICY "Usuários podem ver board columns" ON public.board_columns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.boards b
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE b.id = board_columns.board_id
    AND (p.role IN ('superuser', 'administrador') OR b.empresa_id = ANY(p.empresa_ids))
  )
);

-- Eventos do calendário - usuários podem ver eventos da sua empresa
CREATE POLICY "Usuários podem ver eventos da sua empresa" ON public.calendario_eventos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

-- Documentos de colaborador - usuários podem ver documentos da sua empresa
CREATE POLICY "Usuários podem ver documentos de colaborador" ON public.documentos_colaborador
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.colaboradores c
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE c.id = documentos_colaborador.colaborador_id
    AND (p.role IN ('superuser', 'administrador') OR c.empresa_id = ANY(p.empresa_ids))
  )
);

-- Activity logs - apenas superusers e administradores
CREATE POLICY "Apenas admins podem ver activity logs" ON public.activity_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('superuser', 'administrador')
  )
);

-- User timesheets - usuários podem ver apenas seus próprios timesheets
CREATE POLICY "Usuários podem ver seus próprios timesheets" ON public.user_timesheets
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar seus próprios timesheets" ON public.user_timesheets
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Processos judiciais - usuários podem ver processos da sua empresa
CREATE POLICY "Usuários podem ver processos da sua empresa" ON public.processos_judiciais
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

-- System modules - todos podem ver (são configurações do sistema)
CREATE POLICY "Todos podem ver system modules" ON public.system_modules
FOR SELECT USING (true);

-- Departamentos - usuários podem ver departamentos da sua empresa
CREATE POLICY "Usuários podem ver departamentos da sua empresa" ON public.departments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR company_id = ANY(p.empresa_ids))
  )
);

-- Etiquetas templates - usuários podem ver templates da sua empresa
CREATE POLICY "Usuários podem ver etiquetas templates da sua empresa" ON public.etiquetas_templates
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.role IN ('superuser', 'administrador') OR empresa_id = ANY(p.empresa_ids))
  )
);

-- Para as demais tabelas, aplicar política básica de empresa
DO $$
DECLARE
    table_name text;
    table_names text[] := ARRAY[
        'agenda_acordos', 'board_permissions', 'comentarios_denuncia', 
        'department_assignments', 'documentos_divida', 'empresa_cobranca_config',
        'empresa_historico', 'eventos', 'historico_cobrancas', 'historico_colaborador',
        'historico_empresa', 'pagamentos', 'processos_documentos', 'processos_historico',
        'processos_valores', 'task_board_members', 'user_departments'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('
            CREATE POLICY "Acesso baseado em empresa" ON public.%I
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.user_id = auth.uid() 
                AND p.role IN (''superuser'', ''administrador'')
              )
            )', table_name);
    END LOOP;
END $$;