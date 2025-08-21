import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TarefaWithUser, Tarefa, TaskFormData, TaskFilters, TaskKPIs, UserProfile } from '@/types/tarefas';
import { useToast } from '@/hooks/use-toast';

export function useTarefasData() {
  const [tarefas, setTarefas] = useState<TarefaWithUser[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url, is_active')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  };

  // Fetch tarefas
  const fetchTarefas = async () => {
    try {
      setLoading(true);
      // First fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tarefas')
        .select('*')
        .eq('is_archived', false)
        .order('ordem_na_coluna', { ascending: true })
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Collect all unique user IDs from both responsavel_id and responsavel_ids
      const allResponsavelIds = new Set<string>();
      tasksData?.forEach(task => {
        if (task.responsavel_id) {
          allResponsavelIds.add(task.responsavel_id);
        }
        if (task.responsavel_ids && Array.isArray(task.responsavel_ids)) {
          task.responsavel_ids.forEach((id: string) => allResponsavelIds.add(id));
        }
      });

      let profilesMap: Record<string, any> = {};
      
      if (allResponsavelIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_active')
          .in('user_id', Array.from(allResponsavelIds));

        if (!profilesError && profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.user_id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine tasks with profiles
      const tarefasWithUsers: TarefaWithUser[] = (tasksData || []).map(task => ({
        ...task,
        responsavel: task.responsavel_id ? profilesMap[task.responsavel_id] : undefined,
        responsaveis: (task.responsavel_ids || [])
          .map((id: string) => profilesMap[id])
          .filter(Boolean)
      }));

      setTarefas(tarefasWithUsers);
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

      // First, ensure departmental boards exist for this company
      await supabase.rpc('create_departmental_boards_for_empresa', {
        p_empresa_id: tarefaData.empresa_id
      });

      // Now look for the board (it should exist now)
      const { data: existingBoard } = await supabase
        .from('boards')
        .select('*')
        .eq('empresa_id', tarefaData.empresa_id)
        .eq('name', targetBoardName)
        .eq('is_active', true)
        .single();

      if (existingBoard) {
        // Get first column (A Fazer)
        const { data: firstColumn } = await supabase
          .from('board_columns')
          .select('*')
          .eq('board_id', existingBoard.id)
          .order('position', { ascending: true })
          .limit(1)
          .single();

        return {
          ...tarefaData,
          board_id: existingBoard.id,
          column_id: firstColumn?.id
        };
      }
    } catch (error) {
      console.warn('Error auto-assigning board:', error);
    }

    return tarefaData;
  };

  // Create tarefa
  const createTarefa = async (tarefaData: TaskFormData): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Validate required fields
      if (!tarefaData.titulo || tarefaData.titulo.trim().length === 0) {
        throw new Error('Título da tarefa é obrigatório');
      }

      // Auto-assign board and column based on module (only if empresa_id is provided)
      let enrichedData = tarefaData;
      try {
        if (tarefaData.empresa_id && tarefaData.modulo_origem) {
          enrichedData = await assignBoardAndColumn(tarefaData);
        }
      } catch (boardError) {
        console.warn('Erro ao atribuir quadro automático:', boardError);
        // Continue without board assignment
      }

      // Handle "none" value for responsavel_id and ensure proper data types
      const processedData = {
        titulo: enrichedData.titulo.trim(),
        descricao: enrichedData.descricao?.trim() || null,
        modulo_origem: enrichedData.modulo_origem || 'geral',
        empresa_id: enrichedData.empresa_id || null,
        responsavel_id: enrichedData.responsavel_id === 'none' ? null : enrichedData.responsavel_id,
        responsavel_ids: (enrichedData as any).responsavel_ids || (enrichedData.responsavel_id && enrichedData.responsavel_id !== 'none' ? [enrichedData.responsavel_id] : []),
        status: enrichedData.status || 'a_fazer',
        prioridade: enrichedData.prioridade || 'media',
        data_vencimento: enrichedData.data_vencimento || null,
        anexos: enrichedData.anexos || null,
        board_id: enrichedData.board_id || null,
        column_id: enrichedData.column_id || null,
        ordem_na_coluna: 0,
        created_by: user.user.id,
        is_archived: false
      };

      console.log('Creating task with data:', processedData);

      const { data, error } = await supabase
        .from('tarefas')
        .insert(processedData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      // Fetch user data for the created task if there's a responsible
      let responsavel: any = undefined;
      if (data.responsavel_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url')
          .eq('user_id', data.responsavel_id)
          .single();
        responsavel = userData;
      }

      const taskWithUser = { ...data, responsavel };
      setTarefas(prev => [...prev, taskWithUser]);
      
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso',
      });

      return taskWithUser;
    } catch (err: any) {
      console.error('Erro ao criar tarefa:', err);
      const errorMessage = err.message || 'Não foi possível criar a tarefa';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update tarefa
  const updateTarefa = async (id: string, updates: Partial<TarefaWithUser>) => {
    try {
      // Process updates to handle responsavel_ids
      const processedUpdates = { ...updates };
      if ((updates as any).responsavel_ids) {
        processedUpdates.responsavel_ids = (updates as any).responsavel_ids;
        processedUpdates.responsavel_id = (updates as any).responsavel_ids[0] || null;
      }

      const { data, error } = await supabase
        .from('tarefas')
        .update(processedUpdates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refetch to ensure we have the latest data with user info
      await fetchTarefas();

      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso',
      });
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
  const updateTarefas = async (updatedTarefas: TarefaWithUser[]) => {
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
  const filterTarefas = (tarefas: TarefaWithUser[], filters: TaskFilters): TarefaWithUser[] => {
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
  const calculateKPIs = (tarefas: TarefaWithUser[]): TaskKPIs => {
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
    fetchUsers();
    fetchTarefas();
  }, []);

  return {
    tarefas,
    users,
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