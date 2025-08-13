-- Criar políticas RLS para o bucket colaborador-docs
-- Política para visualizar documentos (admin/superuser podem ver todos, empresariais veem da sua empresa)
CREATE POLICY "Users can view colaborador documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      name SIMILAR TO '%[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}%' AND
      EXISTS (
        SELECT 1 FROM public.colaboradores 
        WHERE colaboradores.id::text = split_part(name, '/', 1)
        AND colaboradores.empresa_id = ANY(
          SELECT unnest(empresa_ids) 
          FROM public.profiles 
          WHERE user_id = auth.uid()
        )
      )
    )
  )
);

-- Política para upload de documentos (admin/superuser podem fazer upload)
CREATE POLICY "Admins can upload colaborador documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Política para atualizar documentos
CREATE POLICY "Admins can update colaborador documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Política para deletar documentos
CREATE POLICY "Admins can delete colaborador documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);