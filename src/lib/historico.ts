import { supabase } from '@/integrations/supabase/client';
import { HistoricoColaborador } from '@/types/hr';

export async function fetchHistorico(colaboradorId: string): Promise<HistoricoColaborador[]> {
  const { data, error } = await supabase
    .from('historico_colaborador')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as HistoricoColaborador[];
}

export async function saveObservacao(
  colaboradorId: string,
  observacao: string,
  anexos?: HistoricoColaborador['anexos']
): Promise<HistoricoColaborador> {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('historico_colaborador')
    .insert({
      colaborador_id: colaboradorId,
      observacao,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  // Return saved record with anexos if provided (not stored in DB)
  return { ...(data as HistoricoColaborador), anexos };
}

