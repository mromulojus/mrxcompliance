-- Create storage bucket for denuncia attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('denuncia-anexos', 'denuncia-anexos', false);

-- Allow anyone (including anonymous) to upload into denuncia-anexos
CREATE POLICY "Anyone can upload denuncia anexos"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'denuncia-anexos'
);

-- Allow admins and superusers to view denuncia anexos
CREATE POLICY "Admins can view denuncia anexos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'denuncia-anexos' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Allow admins and superusers to update denuncia anexos
CREATE POLICY "Admins can update denuncia anexos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'denuncia-anexos' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

-- Allow admins and superusers to delete denuncia anexos
CREATE POLICY "Admins can delete denuncia anexos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'denuncia-anexos' AND
  (
    has_role(auth.uid(), 'superuser'::user_role) OR
    has_role(auth.uid(), 'administrador'::user_role)
  )
);

