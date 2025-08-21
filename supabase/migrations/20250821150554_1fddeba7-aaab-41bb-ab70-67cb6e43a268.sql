-- Allow anonymous users to select denuncias they just created
-- by temporarily allowing access based on recent creation time
CREATE POLICY "Anonymous can view recent denuncias" 
ON public.denuncias 
FOR SELECT 
USING (
  -- Allow access to denuncias created in the last 5 minutes
  created_at > (now() - interval '5 minutes') OR
  -- Allow normal authenticated access
  (has_role(auth.uid(), 'superuser'::user_role) OR 
   has_role(auth.uid(), 'administrador'::user_role) OR 
   (has_role(auth.uid(), 'empresarial'::user_role) AND 
    empresa_id IN (SELECT unnest(profiles.empresa_ids) FROM profiles WHERE profiles.user_id = auth.uid())))
);