import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tarefa, TarefaWithUser, TaskFormData, TaskFilters, TaskKPIs, UserProfile, TaskStatus } from '@/types/tarefas';
import type { DepartmentAssignment } from '@/types/departments';
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

      // Buscar tarefas (compatível com backends sem coluna is_archived e/ou sem ordem_na_coluna)
      let tarefasRaw: any[] | null = null;

      // Tentativa principal: ordenar por ordem_na_coluna e created_at
      const firstTry = await supabase
        .from('tarefas')
        .select('*')
        .order('ordem_na_coluna', { ascending: true })
        .order('created_at', { ascending: false });

      if (firstTry.error) {
        console.warn('Falha na ordenação por ordem_na_coluna, tentando fallback:', firstTry.error.message);
        // Fallback: ordenar apenas por created_at
        const secondTry = await supabase
          .from('tarefas')
          .select('*')
          .order('created_at', { ascending: false });

        if (secondTry.error) {
          console.warn('Falha na ordenação por created_at, tentando sem ordenação:', secondTry.error.message);
          // Último fallback: sem ordenação para ao menos obter dados
          const thirdTry = await supabase
            .from('tarefas')
            .select('*');

          if (thirdTry.error) throw thirdTry.error;
          tarefasRaw = thirdTry.data || [];
        } else {
          tarefasRaw = secondTry.data || [];
        }
      } else {
        tarefasRaw = firstTry.data || [];
      }

      // Filtrar arquivadas no cliente, tratando ausência da coluna como não arquivado
      const tarefasData = (tarefasRaw || []).filter((t: any) => t?.is_archived !== true);

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

      // Buscar department assignments das tarefas
      const tarefaIds = (tarefasData || []).map(t => t.id);
      let assignmentsByTask: Record<string, DepartmentAssignment[]> = {};
      if (tarefaIds.length > 0) {
      // Department assignments table removed - not available
      // const { data: assignments } = await supabase
      //   .from('department_assignments')
      //   .select('resource_id, department_id, is_primary')
      //   .eq('resource_type', 'tarefas')
      //   .in('resource_id', tarefaIds);
      const assignments: any[] = [];
        assignmentsByTask = (assignments || []).reduce((acc, a) => {
          const list = acc[a.resource_id as string] || [];
          list.push(a as unknown as DepartmentAssignment);
          acc[a.resource_id as string] = list;
          return acc;
        }, {} as Record<string, DepartmentAssignment[]>);
      }

      // Combinar dados
      const tarefasWithUsers: TarefaWithUser[] = tarefasData?.map(tarefa => {
        const assigns = assignmentsByTask[tarefa.id] || [];
        const primary = assigns.find(a => a.is_primary)?.department_id;
        return {
          ...tarefa,
          department_ids: assigns.map(a => a.department_id),
          primary_department_id: primary,
          responsavel: tarefa.responsavel_id
            ? responsaveisData.find(user => user.user_id === tarefa.responsavel_id)
            : undefined
        };
      }) || [];

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
  const createTarefa = useCallback(async (tarefaData: TaskFormData): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Auto-assign board and column based on module
      const enrichedData = await assignBoardAndColumn(tarefaData);

      // Handle "none" value for responsavel_id and support responsavel_ids
      const processedData = {
        ...enrichedData,
        responsavel_id: enrichedData.responsavel_id === 'none' ? null : enrichedData.responsavel_id,
        responsavel_ids: (enrichedData as any).responsavel_ids || (enrichedData.responsavel_id && enrichedData.responsavel_id !== 'none' ? [enrichedData.responsavel_id] : []),
        created_by: user.user.id,
      };

      const { data, error } = await supabase
        .from('tarefas')
        .insert(processedData as any)
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
        description: 'Tarefa criada e direcionada para o quadro departamental',
      });

      // Don't return anything - function should return Promise<void>
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
  const updateTarefa = useCallback(async (id: string, updates: Partial<TarefaWithUser>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('tarefas')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      // Department assignment removed - function not available
      // if (updates.departments && updates.departments.length > 0) {
      //   await supabase.rpc('assign_departments_to_resource', {
      //     resource_id: id,
      //     resource_type: 'task',
      //     department_ids: updates.departments || []
      //   });
      // }

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

      if (filters.department) {
        const ids = tarefa.department_ids || [];
        if (!ids.includes(filters.department)) return false;
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