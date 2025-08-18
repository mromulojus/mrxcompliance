import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tarefa, TarefaWithUser, TaskFormData, TaskFilters, TaskKPIs, UserProfile } from '@/types/tarefas';
import { useToast } from '@/hooks/use-toast';

export function useTarefasData() {
  const [tarefas, setTarefas] = useState<TarefaWithUser[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users data
  const fetchUsers = useCallback(async () => {
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
  }, []);

  // Fetch tarefas with user data
  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar tarefas
      const { data: tarefasData, error: tarefasError } = await supabase
        .from('tarefas')
        .select('*')
        .order('ordem_na_coluna', { ascending: true })
        .order('created_at', { ascending: false });

      if (tarefasError) throw tarefasError;

      // Buscar dados dos usuários responsáveis
      const responsavelIds = [...new Set(
        tarefasData
          ?.filter(t => t.responsavel_id)
          ?.map(t => t.responsavel_id)
          ?.filter(Boolean) || []
      )];

      let responsaveisData: UserProfile[] = [];
      if (responsavelIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_active')
          .in('user_id', responsavelIds);

        if (usersError) throw usersError;
        responsaveisData = usersData || [];
      }

      // Combinar dados
      const tarefasWithUsers: TarefaWithUser[] = tarefasData?.map(tarefa => ({
        ...tarefa,
        responsavel: tarefa.responsavel_id 
          ? responsaveisData.find(user => user.user_id === tarefa.responsavel_id)
          : undefined
      })) || [];

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
  }, [toast]);

  // Create tarefa
  const createTarefa = useCallback(async (tarefaData: TaskFormData) => {
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

      // Buscar dados do usuário responsável se houver
      let responsavel: UserProfile | undefined;
      if (data.responsavel_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_active')
          .eq('user_id', data.responsavel_id)
          .single();
        responsavel = userData || undefined;
      }

      const tarefaWithUser: TarefaWithUser = {
        ...data,
        responsavel
      };

      setTarefas(prev => [...prev, tarefaWithUser]);
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso',
      });

      return tarefaWithUser;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Update tarefa
  const updateTarefa = useCallback(async (id: string, updates: Partial<Tarefa>) => {
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Buscar dados do usuário responsável se houver mudança
      let responsavel: UserProfile | undefined;
      if (updates.responsavel_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_active')
          .eq('user_id', updates.responsavel_id)
          .single();
        responsavel = userData || undefined;
      }

      setTarefas(prev => prev.map(t => {
        if (t.id === id) {
          return {
            ...data,
            responsavel: updates.responsavel_id ? responsavel : t.responsavel
          };
        }
        return t;
      }));

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
  }, [toast]);

  // Delete tarefa
  const deleteTarefa = useCallback(async (id: string) => {
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
  }, [toast]);

  // Reorder tasks using Supabase function
  const reorderTasks = useCallback(async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    try {
      const { error } = await supabase
        .rpc('reorder_tasks_in_column', {
          p_task_id: taskId,
          p_new_status: newStatus,
          p_new_order: newOrder
        });

      if (error) throw error;

      // Refresh tasks to get updated order
      await fetchTarefas();
    } catch (err) {
      console.error('Erro ao reordenar tarefas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar as tarefas',
        variant: 'destructive',
      });
    }
  }, [fetchTarefas, toast]);

  // Filter tarefas
  const filterTarefas = useCallback((tarefas: TarefaWithUser[], filters: TaskFilters): TarefaWithUser[] => {
    return tarefas.filter(tarefa => {
      if (filters.busca) {
        const searchTerm = filters.busca.toLowerCase();
        const matchesSearch = 
          tarefa.titulo.toLowerCase().includes(searchTerm) ||
          tarefa.descricao?.toLowerCase().includes(searchTerm) ||
          tarefa.responsavel?.full_name?.toLowerCase().includes(searchTerm) ||
          tarefa.responsavel?.username?.toLowerCase().includes(searchTerm);
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
  }, []);

  // Calculate KPIs
  const calculateKPIs = useCallback((tarefas: TarefaWithUser[]): TaskKPIs => {
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
  }, []);

  // Current user
  const currentUser = useMemo(() => {
    return users.find(user => user.user_id === tarefas.find(t => t.created_by)?.created_by);
  }, [users, tarefas]);

  useEffect(() => {
    fetchUsers();
    fetchTarefas();
  }, [fetchUsers, fetchTarefas]);

  return {
    tarefas,
    users,
    currentUser,
    loading,
    error,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    reorderTasks,
    filterTarefas,
    calculateKPIs,
    refreshTarefas: fetchTarefas,
  };
}