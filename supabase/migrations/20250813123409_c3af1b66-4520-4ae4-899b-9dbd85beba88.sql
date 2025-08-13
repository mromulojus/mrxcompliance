-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('colaborador-docs', 'colaborador-docs', false);

-- Create storage policies for document uploads
CREATE POLICY "Users can view their company documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role) OR
    (
      has_role(auth.uid(), 'empresarial'::user_role) AND
      (storage.foldername(name))[1] IN (
        SELECT empresa_id::text 
        FROM colaboradores 
        WHERE empresa_id = ANY(
          SELECT unnest(empresa_ids) 
          FROM profiles 
          WHERE user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "Admins can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

CREATE POLICY "Admins can update documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

CREATE POLICY "Admins can delete documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'colaborador-docs' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);