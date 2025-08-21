-- Adicionar foreign key constraint para created_by na tabela historico_colaborador
ALTER TABLE public.historico_colaborador 
ADD CONSTRAINT fk_historico_colaborador_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;