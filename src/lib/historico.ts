import { supabase } from '@/integrations/supabase/client';
import { HistoricoColaborador } from '@/types/hr';

/**
 * Converte um registro bruto do Supabase para o formato utilizado pela aplicação.
 * Pode ser reutilizado por componentes que precisem padronizar a exibição do histórico.
 */
export const formatarHistorico = (item: any): HistoricoColaborador => ({
  id: item.id,
  data: item.created_at,
  observacao: item.observacao,
  usuario: item.created_by,
  created_at: item.created_at,
});

/**
 * Salva uma nova observação no histórico do colaborador.
 * Centraliza validação de campos obrigatórios e tratamento de erros.
 */
export const saveObservacao = async (colaboradorId: string, observacao: string) => {
  if (!colaboradorId || !observacao?.trim()) {
    throw new Error('colaboradorId e observacao são obrigatórios');
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('historico_colaborador')
    .insert({
      colaborador_id: colaboradorId,
      observacao,
      created_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao salvar observação: ${error.message}`);
  }

  return formatarHistorico(data);
};

/**
 * Busca o histórico completo de um colaborador já formatado.
 */
export const fetchHistorico = async (colaboradorId: string): Promise<HistoricoColaborador[]> => {
  const { data, error } = await supabase
    .from('historico_colaborador')
    .select('*')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar histórico: ${error.message}`);
  }

  return (data || []).map(formatarHistorico);
};

export default {
  saveObservacao,
  fetchHistorico,
  formatarHistorico,
};

