-- Create historico_anexos table
CREATE TABLE public.historico_anexos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  historico_id UUID NOT NULL REFERENCES public.historico_colaborador(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL
);

ALTER TABLE public.historico_anexos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins or company members can view attachments" ON public.historico_anexos
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'administrador')
    OR EXISTS (
      SELECT 1 FROM public.historico_colaborador h
      JOIN public.colaboradores c ON c.id = h.colaborador_id
      WHERE h.id = historico_anexos.historico_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );

CREATE POLICY "Only HR of same company can insert attachments" ON public.historico_anexos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'rh')
    AND EXISTS (
      SELECT 1 FROM public.historico_colaborador h
      JOIN public.colaboradores c ON c.id = h.colaborador_id
      WHERE h.id = historico_anexos.historico_id
        AND public.user_can_access_empresa(c.empresa_id)
    )
  );
