import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TarefaWithUser } from '@/types/tarefas';
import { useToast } from '@/hooks/use-toast';

export interface TaskBoard {
  id: string;
  name: string;
  empresa_id?: string | null;
  created_by: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskColumn {
  id: string;
  board_id: string;
  name: string;
  color?: string | null;
  order_index: number;
  created_at: string;
}

export function useTaskBoards(boardId?: string) {
  const [boards, setBoards] = useState<TaskBoard[]>([]);
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<TarefaWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const sb = supabase as any;
      const { data: user } = await sb.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');
      const { data, error } = await sb
        .from('task_boards')
        .select('*')
        .eq('created_by', user.user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBoards(data || []);
    } catch (err) {
      console.error('Erro ao buscar quadros:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os quadros', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createBoard = useCallback(async (name: string, empresa_id?: string) => {
    try {
      const sb = supabase as any;
      const { data: user } = await sb.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');
      const { data, error } = await sb
        .from('task_boards')
        .insert({ name, empresa_id: empresa_id || null, created_by: user.user.id })
        .select()
        .single();
      if (error) throw error;
      setBoards(prev => [data as TaskBoard, ...prev]);
      toast({ title: 'Quadro criado', description: 'Seu quadro foi criado com sucesso.' });
      return data as TaskBoard;
    } catch (err) {
      console.error('Erro ao criar quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível criar o quadro', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  const updateBoard = useCallback(async (id: string, name: string) => {
    try {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('task_boards')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setBoards(prev => prev.map(b => b.id === id ? (data as TaskBoard) : b));
      toast({ title: 'Quadro atualizado', description: 'Nome do quadro foi atualizado.' });
    } catch (err) {
      console.error('Erro ao atualizar quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o quadro', variant: 'destructive' });
    }
  }, [toast]);

  const deleteBoard = useCallback(async (id: string) => {
    try {
      const sb = supabase as any;
      const { error } = await sb
        .from('task_boards')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setBoards(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Quadro excluído', description: 'O quadro foi removido.' });
    } catch (err) {
      console.error('Erro ao excluir quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível excluir o quadro', variant: 'destructive' });
    }
  }, [toast]);

  const fetchColumns = useCallback(async (bId: string) => {
    try {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('task_columns')
        .select('*')
        .eq('board_id', bId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      setColumns(data || []);
    } catch (err) {
      console.error('Erro ao buscar colunas:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar as colunas', variant: 'destructive' });
    }
  }, [toast]);

  const createColumn = useCallback(async (bId: string, name: string) => {
    try {
      const order_index = (columns?.filter(c => c.board_id === bId)?.length || 0);
      const sb = supabase as any;
      const { data, error } = await sb
        .from('task_columns')
        .insert({ board_id: bId, name, order_index })
        .select()
        .single();
      if (error) throw error;
      setColumns(prev => [...prev, data as TaskColumn].sort((a, b) => a.order_index - b.order_index));
      toast({ title: 'Coluna criada', description: 'A coluna foi adicionada.' });
      return data as TaskColumn;
    } catch (err) {
      console.error('Erro ao criar coluna:', err);
      toast({ title: 'Erro', description: 'Não foi possível criar a coluna', variant: 'destructive' });
      throw err;
    }
  }, [columns, toast]);

  const updateColumn = useCallback(async (id: string, updates: Partial<Pick<TaskColumn, 'name' | 'color'>>) => {
    try {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('task_columns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setColumns(prev => prev.map(c => c.id === id ? (data as TaskColumn) : c));
      toast({ title: 'Coluna atualizada', description: 'A coluna foi atualizada.' });
    } catch (err) {
      console.error('Erro ao atualizar coluna:', err);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a coluna', variant: 'destructive' });
    }
  }, [toast]);

  const deleteColumn = useCallback(async (id: string) => {
    try {
      const sb = supabase as any;
      const { error } = await sb
        .from('task_columns')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setColumns(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Coluna excluída', description: 'A coluna foi removida.' });
    } catch (err) {
      console.error('Erro ao excluir coluna:', err);
      toast({ title: 'Erro', description: 'Não foi possível excluir a coluna', variant: 'destructive' });
    }
  }, [toast]);

  const fetchBoardTasks = useCallback(async (bId: string) => {
    try {
      const sb = supabase as any;
      const { data: tasksData, error } = await sb
        .from('tarefas')
        .select('*')
        .eq('board_id', bId)
        .order('ordem_na_coluna', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;

      // load responsaveis
      const responsavelIds = [...new Set((tasksData || []).map(t => t.responsavel_id).filter(Boolean))] as string[];
      let profiles: Record<string, any> = {};
      if (responsavelIds.length) {
        const { data: usersData } = await (supabase as any)
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_active')
          .in('user_id', responsavelIds);
        profiles = Object.fromEntries((usersData || []).map(u => [u.user_id, u]));
      }

      const withUsers: TarefaWithUser[] = (tasksData || []).map(t => ({
        ...t,
        responsavel: t.responsavel_id ? profiles[t.responsavel_id] : undefined,
      })) as unknown as TarefaWithUser[];

      setTasks(withUsers);
    } catch (err) {
      console.error('Erro ao buscar tarefas do quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar as tarefas do quadro', variant: 'destructive' });
    }
  }, [toast]);

  const createTaskInColumn = useCallback(async (bId: string, cId: string, payload: any) => {
    try {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('tarefas')
        .insert({ ...payload, board_id: bId, column_id: cId })
        .select()
        .single();
      if (error) throw error;
      setTasks(prev => [...prev, data as unknown as TarefaWithUser]);
      toast({ title: 'Tarefa criada', description: 'A tarefa foi adicionada no quadro.' });
    } catch (err) {
      console.error('Erro ao criar tarefa no quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível criar a tarefa', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  const reorderTask = useCallback(async (taskId: string, newColumnId: string, newOrder: number) => {
    try {
      // fetch tasks in target column to compute shifts
      const targetTasks = tasks.filter(t => t.column_id === newColumnId && t.id !== taskId)
        .sort((a, b) => (a.ordem_na_coluna || 0) - (b.ordem_na_coluna || 0));

      // update orders of affected tasks
      const updates = targetTasks.map((t, idx) => ({ id: t.id, ordem_na_coluna: idx >= newOrder ? idx + 1 : idx }));
      for (const u of updates) {
        await (supabase as any).from('tarefas').update({ ordem_na_coluna: u.ordem_na_coluna }).eq('id', u.id);
      }
      // move the task
      await (supabase as any).from('tarefas').update({ column_id: newColumnId, ordem_na_coluna: newOrder }).eq('id', taskId);

      // refresh
      if (boardId) await fetchBoardTasks(boardId);
    } catch (err) {
      console.error('Erro ao reordenar tarefa:', err);
      toast({ title: 'Erro', description: 'Não foi possível mover a tarefa', variant: 'destructive' });
    }
  }, [tasks, boardId, fetchBoardTasks, toast]);

  useEffect(() => {
    void fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (boardId) {
      void fetchColumns(boardId);
      void fetchBoardTasks(boardId);
    }
  }, [boardId, fetchColumns, fetchBoardTasks]);

  const board = useMemo(() => boards.find(b => b.id === boardId), [boards, boardId]);

  return {
    boards,
    board,
    columns,
    tasks,
    loading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    fetchBoardTasks,
    createTaskInColumn,
    reorderTask,
  };
}

