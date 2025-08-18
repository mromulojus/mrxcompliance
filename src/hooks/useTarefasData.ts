import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tarefa, TaskFormData, TaskFilters, TaskKPIs } from '@/types/tarefas';
import { useToast } from '@/hooks/use-toast';

export function useTarefasData() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch tarefas
  const fetchTarefas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tarefas')
        .select('*')
        .order('ordem_na_coluna', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTarefas(data || []);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError('Erro ao carregar tarefas');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create tarefa
  const createTarefa = async (tarefaData: TaskFormData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Handle "none" value for responsavel_id
      const processedData = {
        ...tarefaData,
        responsavel_id: tarefaData.responsavel_id === 'none' ? null : tarefaData.responsavel_id,
        created_by: user.user.id,
      };

      const { data, error } = await supabase
        .from('tarefas')
        .insert(processedData)
        .select()
        .single();

      if (error) throw error;

      setTarefas(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso',
      });

      return data;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update tarefa
  const updateTarefa = async (id: string, updates: Partial<Tarefa>) => {
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTarefas(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso',
      });

      return data;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete tarefa
  const deleteTarefa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTarefas(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Tarefa excluída com sucesso',
      });
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Bulk update tarefas (for drag and drop)
  const updateTarefas = async (updatedTarefas: Tarefa[]) => {
    try {
      const updates = updatedTarefas.map((tarefa, index) => ({
        id: tarefa.id,
        status: tarefa.status,
        ordem_na_coluna: index,
      }));

      for (const update of updates) {
        await supabase
          .from('tarefas')
          .update({
            status: update.status,
            ordem_na_coluna: update.ordem_na_coluna,
          })
          .eq('id', update.id);
      }

      setTarefas(updatedTarefas);
    } catch (err) {
      console.error('Erro ao atualizar ordem das tarefas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar as tarefas',
        variant: 'destructive',
      });
    }
  };

  // Filter tarefas
  const filterTarefas = (tarefas: Tarefa[], filters: TaskFilters): Tarefa[] => {
    return tarefas.filter(tarefa => {
      if (filters.busca) {
        const searchTerm = filters.busca.toLowerCase();
        const matchesSearch = 
          tarefa.titulo.toLowerCase().includes(searchTerm) ||
          tarefa.descricao?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      if (filters.prioridade && tarefa.prioridade !== filters.prioridade) {
        return false;
      }

      if (filters.modulo && tarefa.modulo_origem !== filters.modulo) {
        return false;
      }

      if (filters.status && tarefa.status !== filters.status) {
        return false;
      }

      if (filters.empresa && tarefa.empresa_id !== filters.empresa) {
        return false;
      }

      if (filters.responsavel) {
        if (filters.responsavel === 'unassigned') {
          if (tarefa.responsavel_id) return false;
        } else if (tarefa.responsavel_id !== filters.responsavel) {
          return false;
        }
      }

      return true;
    });
  };

  // Calculate KPIs
  const calculateKPIs = (tarefas: Tarefa[]): TaskKPIs => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return {
      total: tarefas.length,
      a_fazer: tarefas.filter(t => t.status === 'a_fazer').length,
      em_andamento: tarefas.filter(t => t.status === 'em_andamento').length,
      em_revisao: tarefas.filter(t => t.status === 'em_revisao').length,
      concluido: tarefas.filter(t => t.status === 'concluido').length,
      atrasadas: tarefas.filter(t => {
        if (!t.data_vencimento || t.status === 'concluido') return false;
        const vencimento = new Date(t.data_vencimento);
        vencimento.setHours(0, 0, 0, 0);
        return vencimento < hoje;
      }).length,
      vencendo_hoje: tarefas.filter(t => {
        if (!t.data_vencimento || t.status === 'concluido') return false;
        const vencimento = new Date(t.data_vencimento);
        vencimento.setHours(0, 0, 0, 0);
        return vencimento.getTime() === hoje.getTime();
      }).length,
    };
  };

  useEffect(() => {
    fetchTarefas();
  }, []);

  return {
    tarefas,
    loading,
    error,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    updateTarefas,
    filterTarefas,
    calculateKPIs,
    refreshTarefas: fetchTarefas,
  };
}