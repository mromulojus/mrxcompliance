-- Fix RLS policy for denuncias table to allow public inserts
DROP POLICY IF EXISTS "Public can insert denuncias" ON public.denuncias;

CREATE POLICY "Public can insert denuncias" 
ON public.denuncias 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for denuncia attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('denuncia-anexos', 'denuncia-anexos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for denuncia attachments
CREATE POLICY "Anyone can upload denuncia attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'denuncia-anexos');

CREATE POLICY "Anyone can view denuncia attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'denuncia-anexos');

CREATE POLICY "Admins can delete denuncia attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'denuncia-anexos' AND has_role(auth.uid(), 'administrador'::user_role));