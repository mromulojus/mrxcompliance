import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

export type HistoricoColaboradorRow = Database['public']['Tables']['historico_colaborador']['Row'];

export async function saveObservacao(colaboradorId: string, observacao: string): Promise<HistoricoColaboradorRow> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = useAuth();

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
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

