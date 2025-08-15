-- Create view exposing limited denuncia status information
CREATE OR REPLACE VIEW public.denuncia_status AS
SELECT protocolo, status, created_at, updated_at
FROM public.denuncias;

-- Enable row level security on the view
ALTER TABLE public.denuncia_status ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated roles to select from the view
GRANT SELECT ON public.denuncia_status TO anon, authenticated;

-- RLS policy restricting access to provided protocol
CREATE POLICY "Allow public select on denuncia_status" ON public.denuncia_status
  FOR SELECT TO anon, authenticated
  USING (protocolo = current_setting('request.jwt.claims.protocolo', true));
