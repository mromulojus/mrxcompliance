import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  ProcessoJudicial, 
  ProcessoHistorico, 
  ProcessoDocumento, 
  ProcessoValor, 
  Evento,
  ProcessoFiltros,
  CalendarioFiltros 
} from '@/types/processos';

export function useProcessosData() {
  const [processos, setProcessos] = useState<ProcessoJudicial[]>([]);
  const [historico, setHistorico] = useState<ProcessoHistorico[]>([]);
  const [documentos, setDocumentos] = useState<ProcessoDocumento[]>([]);
  const [valores, setValores] = useState<ProcessoValor[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch processos judiciais
  const fetchProcessos = async (filtros?: ProcessoFiltros) => {
    try {
      let query = supabase
        .from('processos_judiciais')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtros?.empresa_id) {
        query = query.eq('empresa_id', filtros.empresa_id);
      }
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.numero_processo) {
        query = query.ilike('numero_processo', `%${filtros.numero_processo}%`);
      }
      if (filtros?.autor) {
        query = query.ilike('autor', `%${filtros.autor}%`);
      }
      if (filtros?.reu) {
        query = query.ilike('reu', `%${filtros.reu}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar processos:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar processos judiciais",
          variant: "destructive",
        });
        return;
      }

      setProcessos(data || []);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    }
  };

  // Fetch histórico do processo
  const fetchHistorico = async (processoId: string) => {
    try {
      const { data, error } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processoId)
        .order('data_evento', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return;
      }

      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  // Fetch documentos do processo
  const fetchDocumentos = async (processoId: string) => {
    try {
      const { data, error } = await supabase
        .from('processos_documentos')
        .select('*')
        .eq('processo_id', processoId)
        .order('data_upload', { ascending: false });

      if (error) {
        console.error('Erro ao buscar documentos:', error);
        return;
      }

      setDocumentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  };

  // Fetch valores do processo
  const fetchValores = async (processoId: string) => {
    try {
      const { data, error } = await supabase
        .from('processos_valores')
        .select('*')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar valores:', error);
        return;
      }

      setValores(data || []);
    } catch (error) {
      console.error('Erro ao buscar valores:', error);
    }
  };

  // Fetch eventos do calendário
  const fetchEventos = async (filtros?: CalendarioFiltros) => {
    try {
      let query = supabase
        .from('eventos')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (filtros?.empresa_id) {
        query = query.eq('empresa_id', filtros.empresa_id);
      }
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros?.data_inicio) {
        query = query.gte('data_inicio', filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte('data_inicio', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar eventos",
          variant: "destructive",
        });
        return;
      }

      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  // Adicionar processo
  const adicionarProcesso = async (processo: Omit<ProcessoJudicial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('processos_judiciais')
        .insert([processo])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar processo:', error);
        toast({
          title: "Erro",
          description: "Falha ao criar processo judicial",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Processo judicial criado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar processo:', error);
      return null;
    }
  };

  // Adicionar evento
  const adicionarEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar evento:', error);
        toast({
          title: "Erro",
          description: "Falha ao criar evento",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      return null;
    }
  };

  // Adicionar histórico
  const adicionarHistorico = async (hist: Omit<ProcessoHistorico, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('processos_historico')
        .insert([hist])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar histórico:', error);
        toast({
          title: "Erro",
          description: "Falha ao adicionar histórico",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
      return null;
    }
  };

  // Atualizar processo
  const atualizarProcesso = async (id: string, updates: Partial<ProcessoJudicial>) => {
    try {
      const { data, error } = await supabase
        .from('processos_judiciais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar processo:', error);
        toast({
          title: "Erro",
          description: "Falha ao atualizar processo",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso",
        description: "Processo atualizado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProcessos(),
        fetchEventos()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    processos,
    historico,
    documentos,
    valores,
    eventos,
    loading,
    fetchProcessos,
    fetchHistorico,
    fetchDocumentos,
    fetchValores,
    fetchEventos,
    adicionarProcesso,
    adicionarEvento,
    adicionarHistorico,
    atualizarProcesso,
  };
}