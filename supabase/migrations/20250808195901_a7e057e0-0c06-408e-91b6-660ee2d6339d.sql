-- Sistema completo de autenticação com 3 níveis de acesso

-- Atualizar a tabela profiles para incluir mais campos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Atualizar a função de criação de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'operacional'::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Criar trigger para automatizar criação de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS mais granulares para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superuser can view all profiles" ON public.profiles;

-- Política para visualizar próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para atualizar próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para administradores visualizarem perfis
CREATE POLICY "Admin can view profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'administrador'::user_role));

-- Política para superuser visualizar todos os perfis
CREATE POLICY "Superuser can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'superuser'::user_role));

-- Política para superuser gerenciar perfis
CREATE POLICY "Superuser can manage profiles" ON public.profiles
  FOR ALL USING (has_role(auth.uid(), 'superuser'::user_role));

-- Função para atualizar último login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.profiles 
  SET last_login = now() 
  WHERE user_id = auth.uid();
$$;