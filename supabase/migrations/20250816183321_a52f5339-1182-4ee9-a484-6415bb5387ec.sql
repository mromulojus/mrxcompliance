-- Adicionar campo etiquetas nas tabelas devedores e dividas
ALTER TABLE public.devedores 
ADD COLUMN etiquetas JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.dividas 
ADD COLUMN etiquetas JSONB DEFAULT '[]'::jsonb;

-- Criar tabela para templates de etiquetas personalizadas
CREATE TABLE public.etiquetas_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#gray',
  empresa_id UUID REFERENCES empresas(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('devedor', 'divida', 'ambos')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS para etiquetas_templates
ALTER TABLE public.etiquetas_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view etiquetas based on empresa access"
  ON public.etiquetas_templates FOR SELECT
  USING (user_can_access_empresa(empresa_id));

CREATE POLICY "Admins can manage etiquetas"
  ON public.etiquetas_templates FOR ALL
  USING (has_role(auth.uid(), 'administrador'::user_role));

-- Inserir etiquetas padrão do sistema
INSERT INTO public.etiquetas_templates (nome, cor, empresa_id, tipo, created_by) VALUES
('Administrativo', '#3b82f6', NULL, 'ambos', NULL),
('Judicial', '#dc2626', NULL, 'ambos', NULL),
('Negativado', '#ea580c', NULL, 'divida', NULL),
('Protestado', '#991b1b', NULL, 'divida', NULL),
('Acordo Firmado', '#16a34a', NULL, 'divida', NULL),
('Contato Realizado', '#0891b2', NULL, 'devedor', NULL),
('Sem Resposta', '#6b7280', NULL, 'devedor', NULL);