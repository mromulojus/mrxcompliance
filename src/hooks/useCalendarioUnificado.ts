import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventoUnificado {
  id: string;
  empresa_id: string;
  titulo: string;
  descricao?: string;
  data_evento: string;
  data_fim?: string;
  tipo_evento: string;
  modulo_origem: string;
  entidade_id?: string;
  entidade_tipo?: string;
  prioridade?: 'alta' | 'media' | 'baixa';
  status?: 'pendente' | 'concluido' | 'cancelado';
  cor_etiqueta?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Campos de compatibilidade para eventos legados
  tipo?: string;
  data_inicio?: string;
  local?: string;
  participantes?: string[];
}

export interface FiltrosCalendario {
  empresa_id?: string;
  modulo_origem?: string[];
  tipo_evento?: string[];
  prioridade?: string[];
  status?: string[];
  data_inicio?: string;
  data_fim?: string;
  apenas_vencidos?: boolean;
  apenas_proximos?: boolean;
}

export const TIPOS_EVENTO_LABELS = {
  // Tarefas
  task_deadline: 'Vencimento de Tarefa',
  task_completion: 'Conclusão de Tarefa',
  
  // Processos
  hearing: 'Audiência',
  deadline: 'Prazo Legal',
  meeting: 'Reunião',
  court_event: 'Evento do Tribunal',
  distribution: 'Distribuição',
  
  // Cobrança
  debt_due: 'Vencimento de Dívida',
  payment: 'Pagamento',
  protest: 'Protesto',
  blacklist: 'Negativação',
  installment: 'Parcela',
  
  // RH
  birthday: 'Aniversário',
  document_due: 'Documento Vencendo',
  compliance_due: 'Auditoria Vencendo',
  
  // Eventos
  custom_event: 'Evento Personalizado'
};

export const MODULOS_LABELS = {
  tarefas: '🎯 Tarefas',
  processos: '⚖️ Processos',
  cobrancas: '💰 Cobrança',
  hr: '👥 RH',
  eventos: '📅 Eventos'
};

export const CORES_POR_TIPO = {
  // Tarefas
  task_deadline: { cor: '#F59E0B', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  task_completion: { cor: '#10B981', bg: 'bg-green-100', text: 'text-green-800' },
  
  // Processos
  hearing: { cor: '#DC2626', bg: 'bg-red-100', text: 'text-red-800' },
  deadline: { cor: '#F59E0B', bg: 'bg-orange-100', text: 'text-orange-800' },
  meeting: { cor: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-800' },
  court_event: { cor: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-800' },
  distribution: { cor: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-800' },
  
  // Cobrança
  debt_due: { cor: '#EF4444', bg: 'bg-red-100', text: 'text-red-800' },
  payment: { cor: '#10B981', bg: 'bg-green-100', text: 'text-green-800' },
  protest: { cor: '#B91C1C', bg: 'bg-red-200', text: 'text-red-900' },
  blacklist: { cor: '#7C2D12', bg: 'bg-orange-200', text: 'text-orange-900' },
  installment: { cor: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  
  // RH
  birthday: { cor: '#EC4899', bg: 'bg-pink-100', text: 'text-pink-800' },
  document_due: { cor: '#F59E0B', bg: 'bg-amber-100', text: 'text-amber-800' },
  compliance_due: { cor: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-800' },
  
  // Eventos
  custom_event: { cor: '#6366F1', bg: 'bg-indigo-100', text: 'text-indigo-800' }
};

export const useCalendarioUnificado = () => {
  const [eventos, setEventos] = useState<EventoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosCalendario>({});
  const { toast } = useToast();

  const fetchEventos = async (filtrosAtivos?: FiltrosCalendario) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('calendario_eventos')
        .select('*')
        .order('data_evento', { ascending: true });

      // Aplicar filtros
      const filtrosParaUsar = filtrosAtivos || filtros;

      if (filtrosParaUsar.empresa_id) {
        query = query.eq('empresa_id', filtrosParaUsar.empresa_id);
      }

      if (filtrosParaUsar.modulo_origem && filtrosParaUsar.modulo_origem.length > 0) {
        query = query.in('modulo_origem', filtrosParaUsar.modulo_origem);
      }

      if (filtrosParaUsar.tipo_evento && filtrosParaUsar.tipo_evento.length > 0) {
        query = query.in('tipo_evento', filtrosParaUsar.tipo_evento);
      }

      if (filtrosParaUsar.prioridade && filtrosParaUsar.prioridade.length > 0) {
        query = query.in('prioridade', filtrosParaUsar.prioridade);
      }

      if (filtrosParaUsar.status && filtrosParaUsar.status.length > 0) {
        query = query.in('status', filtrosParaUsar.status);
      }

      if (filtrosParaUsar.data_inicio) {
        query = query.gte('data_evento', filtrosParaUsar.data_inicio);
      }

      if (filtrosParaUsar.data_fim) {
        query = query.lte('data_evento', filtrosParaUsar.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;

      let eventosProcessados = data || [];

      // Filtros pós-processamento
      if (filtrosParaUsar.apenas_vencidos) {
        const hoje = new Date();
        eventosProcessados = eventosProcessados.filter(evento => 
          new Date(evento.data_evento) < hoje && evento.status === 'pendente'
        );
      }

      if (filtrosParaUsar.apenas_proximos) {
        const hoje = new Date();
        const proximosSete = new Date();
        proximosSete.setDate(hoje.getDate() + 7);
        
        eventosProcessados = eventosProcessados.filter(evento => 
          new Date(evento.data_evento) >= hoje && 
          new Date(evento.data_evento) <= proximosSete &&
          evento.status === 'pendente'
        );
      }

      setEventos(eventosProcessados as EventoUnificado[]);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast({
        title: 'Erro ao carregar eventos',
        description: 'Não foi possível carregar os eventos do calendário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const criarEventoCustom = async (evento: Omit<EventoUnificado, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('calendario_eventos')
        .insert({
          ...evento,
          tipo_evento: 'custom_event',
          modulo_origem: 'eventos'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Evento criado',
        description: 'Evento personalizado criado com sucesso.',
      });

      fetchEventos();
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: 'Erro ao criar evento',
        description: 'Não foi possível criar o evento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const atualizarEvento = async (id: string, updates: Partial<EventoUnificado>) => {
    try {
      const { error } = await supabase
        .from('calendario_eventos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Evento atualizado',
        description: 'Evento atualizado com sucesso.',
      });

      fetchEventos();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: 'Erro ao atualizar evento',
        description: 'Não foi possível atualizar o evento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletarEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendario_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Evento removido',
        description: 'Evento removido com sucesso.',
      });

      fetchEventos();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast({
        title: 'Erro ao remover evento',
        description: 'Não foi possível remover o evento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const marcarComoConcluido = async (id: string) => {
    await atualizarEvento(id, { status: 'concluido' });
  };

  // Estatísticas e dados derivados
  const estatisticas = useMemo(() => {
    const hoje = new Date();
    const vencidos = eventos.filter(e => 
      new Date(e.data_evento) < hoje && e.status === 'pendente'
    );
    const proximosSete = eventos.filter(e => {
      const dataEvento = new Date(e.data_evento);
      const seteDias = new Date();
      seteDias.setDate(hoje.getDate() + 7);
      return dataEvento >= hoje && dataEvento <= seteDias && e.status === 'pendente';
    });
    
    return {
      total: eventos.length,
      vencidos: vencidos.length,
      proximosSete: proximosSete.length,
      concluidos: eventos.filter(e => e.status === 'concluido').length,
      porModulo: eventos.reduce((acc, evento) => {
        acc[evento.modulo_origem] = (acc[evento.modulo_origem] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      porTipo: eventos.reduce((acc, evento) => {
        acc[evento.tipo_evento] = (acc[evento.tipo_evento] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [eventos]);

  const getEventosDoDia = (data: Date) => {
    const dataStr = data.toISOString().split('T')[0];
    return eventos.filter(evento => 
      evento.data_evento.startsWith(dataStr)
    );
  };

  const hasEventoNoDia = (data: Date) => {
    return getEventosDoDia(data).length > 0;
  };

  const aplicarFiltros = (novosFiltros: FiltrosCalendario) => {
    setFiltros(novosFiltros);
    fetchEventos(novosFiltros);
  };

  const limparFiltros = () => {
    setFiltros({});
    fetchEventos({});
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return {
    eventos,
    loading,
    filtros,
    estatisticas,
    fetchEventos,
    criarEventoCustom,
    atualizarEvento,
    deletarEvento,
    marcarComoConcluido,
    getEventosDoDia,
    hasEventoNoDia,
    aplicarFiltros,
    limparFiltros
  };
};