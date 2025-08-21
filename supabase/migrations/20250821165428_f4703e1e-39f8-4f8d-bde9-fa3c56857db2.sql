-- Add anexos column to comentarios_denuncia table to support file attachments
ALTER TABLE public.comentarios_denuncia 
ADD COLUMN anexos text[] DEFAULT '{}';

-- Create RLS policies for comment attachment uploads and views
CREATE POLICY "Admin can upload comment attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'denuncia-anexos' AND 
  has_role(auth.uid(), 'administrador'::user_role) AND
  (storage.foldername(name))[1] = 'comentarios'
);

CREATE POLICY "Admin can view comment attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'denuncia-anexos' AND 
  has_role(auth.uid(), 'administrador'::user_role) AND
  (storage.foldername(name))[1] = 'comentarios'
);

CREATE POLICY "Admin can delete comment attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'denuncia-anexos' AND 
  has_role(auth.uid(), 'administrador'::user_role) AND
  (storage.foldername(name))[1] = 'comentarios'
);