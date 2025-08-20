import { supabase } from '@/integrations/supabase/client';
import type { HistoricoColaborador } from '@/types/hr';

export async function saveObservacao(
  colaboradorId: string,
  observacao: string
): Promise<HistoricoColaborador> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message || 'Falha ao obter usuário autenticado');
  }
  const user = userData.user;
  if (!user?.id) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('historico_colaborador')
    .insert({
      colaborador_id: colaboradorId,
      observacao,
      created_by: user.id
    })
    .select('*, profiles:created_by(full_name)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    data: data.created_at,
    observacao: data.observacao,
    usuario: data.profiles?.full_name || ''
  };
}

