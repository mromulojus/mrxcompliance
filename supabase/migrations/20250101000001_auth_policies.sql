-- Configurações de autenticação e políticas de senha
-- As configurações de senha e OTP devem ser configuradas no dashboard do Supabase
-- Este arquivo serve como documentação das políticas implementadas

-- NOTA: As seguintes configurações devem ser aplicadas manualmente no dashboard:
-- 
-- Auth Settings > Password Policy:
-- - Minimum length: 12 characters
-- - Minimum uppercase: 1
-- - Minimum lowercase: 1 
-- - Minimum number: 1
-- - Minimum special: 1
-- - HIBP enabled: true
--
-- Auth Settings > OTP:
-- - Expiry duration: 300 seconds (5 minutes)
--
-- Auth Settings > General:
-- - Site URL: https://mrxbr.app
-- - Additional redirect URLs: https://mrxbr.app, http://localhost:3000
-- - JWT expiry: 3600 seconds
-- - Enable signup: true
-- - Double confirm email changes: true
-- - Enable SMS signup: false

-- Garantir que as funções de autenticação estão disponíveis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se as configurações foram aplicadas (informativo)
DO $$
BEGIN
    RAISE NOTICE 'Configurações de autenticação devem ser aplicadas no dashboard do Supabase';
    RAISE NOTICE 'Site URL: https://mrxbr.app';
    RAISE NOTICE 'Políticas de senha: mínimo 12 caracteres, maiúscula, minúscula, número, especial';
    RAISE NOTICE 'OTP expiry: 5 minutos';
END $$;
