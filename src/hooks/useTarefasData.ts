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
        .eq('is_archived', false)
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

  // Module to board mapping
  const getModuleToBoardMapping = () => ({
    'geral': 'ADMINISTRATIVO',
    'ouvidoria': 'OUVIDORIA (Ouve.ai)',
    'auditoria': 'COMPLIANCE (Mrx Compliance)',
    'compliance': 'COMPLIANCE (Mrx Compliance)',
    'cobrancas': 'COBRANÇA (Debto)',
    'vendas': 'VENDAS (xGROWTH)',
    'juridico': 'JURIDICO (MR Advocacia)'
  });

  // Auto-assign board and column based on module and company
  const assignBoardAndColumn = async (tarefaData: TaskFormData) => {
    if (!tarefaData.empresa_id || !tarefaData.modulo_origem) {
      return tarefaData;
    }

    try {
      const moduleMapping = getModuleToBoardMapping();
      const targetBoardName = moduleMapping[tarefaData.modulo_origem];
      
      if (!targetBoardName) {
        return tarefaData;
      }

      // Look for existing board
      const { data: existingBoard } = await supabase
        .from('boards')
        .select('*')
        .eq('empresa_id', tarefaData.empresa_id)
        .eq('name', targetBoardName)
        .eq('is_active', true)
        .single();

      let boardId = existingBoard?.id;

      // If no board exists, create it using the existing function
      if (!boardId) {
        await supabase.rpc('create_departmental_boards_for_empresa', {
          p_empresa_id: tarefaData.empresa_id
        });

        // Fetch the created board
        const { data: newBoard } = await supabase
          .from('boards')
          .select('*')
          .eq('empresa_id', tarefaData.empresa_id)
          .eq('name', targetBoardName)
          .eq('is_active', true)
          .single();

        boardId = newBoard?.id;
      }

      if (boardId) {
        // Get first column (A Fazer)
        const { data: firstColumn } = await supabase
          .from('board_columns')
          .select('*')
          .eq('board_id', boardId)
          .order('position', { ascending: true })
          .limit(1)
          .single();

        return {
          ...tarefaData,
          board_id: boardId,
          column_id: firstColumn?.id
        };
      }
    } catch (error) {
      console.warn('Error auto-assigning board:', error);
    }

    return tarefaData;
  };

  // Create tarefa
  const createTarefa = async (tarefaData: TaskFormData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Auto-assign board and column based on module
      const enrichedData = await assignBoardAndColumn(tarefaData);

      // Handle "none" value for responsavel_id
      const processedData = {
        ...enrichedData,
        responsavel_id: enrichedData.responsavel_id === 'none' ? null : enrichedData.responsavel_id,
        created_by: user.user.id,
      };

      const { data, error } = await supabase
        .from('tarefas')
        .insert(processedData as any)
        .select()
        .single();

      if (error) throw error;

      setTarefas(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada e direcionada para o quadro departamental',
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
        .update(updates as any)
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

  // Archive tarefa
  const archiveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ 
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Remove from current tasks list
      setTarefas(prev => prev.filter(t => t.id !== taskId));
      
      toast({
        title: "Tarefa arquivada",
        description: "A tarefa foi arquivada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao arquivar tarefa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar a tarefa.",
        variant: "destructive"
      });
      throw error;
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
    archiveTask,
    updateTarefas,
    filterTarefas,
    calculateKPIs,
    refreshTarefas: fetchTarefas,
  };
}