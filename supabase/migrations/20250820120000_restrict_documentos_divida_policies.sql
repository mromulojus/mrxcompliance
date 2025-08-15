-- Tighten policies for documentos_divida to allow only admins or uploader

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view documentos based on empresa access" ON public.documentos_divida;
DROP POLICY IF EXISTS "Admins can manage documentos" ON public.documentos_divida;

-- Allow uploader or administrators to view documents
CREATE POLICY "Uploader or admin can view documentos_divida" ON public.documentos_divida
  FOR SELECT TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'administrador'));

-- Restrict all modifications to administrators
CREATE POLICY "Admin can manage documentos_divida" ON public.documentos_divida
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'))
  WITH CHECK (public.has_role(auth.uid(), 'administrador'));
