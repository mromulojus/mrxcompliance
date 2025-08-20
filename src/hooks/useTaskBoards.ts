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
  card_default?: any | null;
}

export interface TaskColumn {
  id: string;
  board_id: string;
  name: string;
  color?: string | null;
  order_index?: number;
  position: number;
  created_at: string;
  updated_at: string;
  card_default?: any | null;
}

export function useTaskBoards(boardId?: string) {
  const [boards, setBoards] = useState<TaskBoard[]>([]);
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<TarefaWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<{ user_id: string; role: string }[]>([]);
  const [boardsSource, setBoardsSource] = useState<'task_boards' | 'boards'>('task_boards');
  const { toast } = useToast();

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const sb = supabase as any;
      const { data: user } = await sb.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');
      // Try legacy table first, then fallback to "boards"
      let usedSource: 'task_boards' | 'boards' = 'task_boards';
      let data: any[] | null = null;

      try {
        const { data: tbData, error: tbError } = await sb
          .from('task_boards')
          .select('*')
          .eq('created_by', user.user.id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });
        if (tbError) throw tbError;
        // If legacy table exists but has no data, attempt to also load from new boards table
        if (tbData && tbData.length > 0) {
          usedSource = 'task_boards';
          data = tbData;
        } else {
          const { data: bData, error: bError } = await sb
            .from('boards')
            .select('id, name, empresa_id, created_by, is_active, created_at, updated_at')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          // If the new table is not accessible, keep legacy empty state
          if (!bError && bData) {
            usedSource = 'boards';
            data = (bData || []).map((row: any) => ({
              id: row.id,
              name: row.name,
              empresa_id: row.empresa_id,
              created_by: row.created_by,
              is_archived: row.is_active === false,
              created_at: row.created_at,
              updated_at: row.updated_at,
              card_default: null,
            })) as TaskBoard[];
          } else {
            usedSource = 'task_boards';
            data = tbData || [];
          }
        }
      } catch (e: any) {
        // Fallback to new table name `boards`
        const { data: bData, error: bError } = await sb
          .from('boards')
          .select('id, name, empresa_id, created_by, is_active, created_at, updated_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (bError) throw bError;
        usedSource = 'boards';
        data = (bData || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          empresa_id: row.empresa_id,
          created_by: row.created_by,
          is_archived: row.is_active === false,
          created_at: row.created_at,
          updated_at: row.updated_at,
          card_default: null,
        })) as TaskBoard[];
      }

      setBoardsSource(usedSource);
      setBoards(data as TaskBoard[]);
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
      let created: any = null;

      const tryCreateInBoards = async () => {
        if (!empresa_id) {
          throw new Error('Empresa obrigatória para criar um quadro.');
        }
        const { data, error } = await sb
          .from('boards')
          .insert({ name, empresa_id, created_by: user.user.id, is_active: true })
          .select('id, name, empresa_id, created_by, is_active, created_at, updated_at')
          .single();
        if (error) throw error;
        setBoardsSource('boards');
        return {
          id: data.id,
          name: data.name,
          empresa_id: data.empresa_id,
          created_by: data.created_by,
          is_archived: data.is_active === false,
          created_at: data.created_at,
          updated_at: data.updated_at,
          card_default: null,
        } as TaskBoard;
      };

      const tryCreateInTaskBoards = async () => {
        const { data, error } = await sb
          .from('task_boards')
          .insert({ name, empresa_id: empresa_id || null, created_by: user.user.id })
          .select()
          .single();
        if (error) throw error;
        setBoardsSource('task_boards');
        return data as TaskBoard;
      };

      // Prefer new boards model when empresa_id is available; otherwise fallback to legacy
      if (empresa_id) {
        try {
          created = await tryCreateInBoards();
        } catch (e) {
          created = await tryCreateInTaskBoards();
        }
      } else {
        try {
          created = await tryCreateInTaskBoards();
        } catch (e) {
          // As last resort, attempt boards with a meaningful error if empresa_id missing
          created = await tryCreateInBoards();
        }
      }

      setBoards(prev => [created as TaskBoard, ...prev]);
      toast({ title: 'Quadro criado', description: 'Seu quadro foi criado com sucesso.' });
      return created as TaskBoard;
    } catch (err) {
      console.error('Erro ao criar quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível criar o quadro', variant: 'destructive' });
      throw err;
    }
  }, [toast]);

  const updateBoard = useCallback(async (id: string, name: string, card_default?: any) => {
    try {
      const sb = supabase as any;
      let updated: TaskBoard | null = null;
      if (boardsSource === 'boards') {
        const { data, error } = await sb
          .from('boards')
          .update({ name })
          .eq('id', id)
          .select('id, name, empresa_id, created_by, is_active, created_at, updated_at')
          .single();
        if (error) throw error;
        updated = {
          id: data.id,
          name: data.name,
          empresa_id: data.empresa_id,
          created_by: data.created_by,
          is_archived: data.is_active === false,
          created_at: data.created_at,
          updated_at: data.updated_at,
          card_default: null,
        } as TaskBoard;
      } else {
        const payload: any = { name };
        if (typeof card_default !== 'undefined') payload.card_default = card_default;
        const { data, error } = await sb
          .from('task_boards')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        updated = data as TaskBoard;
      }

      setBoards(prev => prev.map(b => b.id === id ? (updated as TaskBoard) : b));
      toast({ title: 'Quadro atualizado', description: 'Nome do quadro foi atualizado.' });
    } catch (err) {
      console.error('Erro ao atualizar quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o quadro', variant: 'destructive' });
    }
  }, [toast]);

  const deleteBoard = useCallback(async (id: string) => {
    try {
      const sb = supabase as any;
      const { error } = boardsSource === 'boards'
        ? await sb.from('boards').delete().eq('id', id)
        : await sb.from('task_boards').delete().eq('id', id);
      if (error) throw error;
      setBoards(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Quadro excluído', description: 'O quadro foi removido.' });
    } catch (err) {
      console.error('Erro ao excluir quadro:', err);
      toast({ title: 'Erro', description: 'Não foi possível excluir o quadro', variant: 'destructive' });
    }
  }, [toast, boardsSource]);

  const fetchColumns = useCallback(async (bId: string) => {
    try {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('board_columns')
        .select('*')
        .eq('board_id', bId)
        .order('position', { ascending: true });
      if (error) throw error;
      setColumns(data || []);
    } catch (err) {
      console.error('Erro ao buscar colunas:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar as colunas', variant: 'destructive' });
    }
  }, [toast]);

  const createColumn = useCallback(async (bId: string, name: string) => {
    try {
      const position = (columns?.filter(c => c.board_id === bId)?.length || 0);
      const sb = supabase as any;
      const { data, error } = await sb
        .from('board_columns')
        .insert({ board_id: bId, name, position })
        .select()
        .single();
      if (error) throw error;
      setColumns(prev => [...prev, data as TaskColumn].sort((a, b) => (a.position || 0) - (b.position || 0)));
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
        .from('board_columns')
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
        .from('board_columns')
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

  const moveColumn = useCallback(async (bId: string, columnId: string, newIndex: number) => {
    try {
      const sb = supabase as any;
      const { error } = await sb.rpc('move_task_column', { p_board_id: bId, p_column_id: columnId, p_new_index: newIndex });
      if (error) throw error;
      await fetchColumns(bId);
    } catch (err) {
      console.error('Erro ao mover coluna:', err);
      toast({ title: 'Erro', description: 'Não foi possível reordenar as colunas', variant: 'destructive' });
    }
  }, [fetchColumns, toast]);

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

  const fetchMembers = useCallback(async (bId: string) => {
    try {
      if (boardsSource === 'boards') {
        setMembers([]);
        return;
      }
      const sb = supabase as any;
      const { data, error } = await sb.from('task_board_members').select('user_id, role').eq('board_id', bId);
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os membros', variant: 'destructive' });
    }
  }, [toast, boardsSource]);

  const addMember = useCallback(async (bId: string, userId: string, role: string = 'member') => {
    if (boardsSource === 'boards') return;
    const sb = supabase as any;
    await sb.from('task_board_members').insert({ board_id: bId, user_id: userId, role });
    await fetchMembers(bId);
  }, [fetchMembers, boardsSource]);

  const removeMember = useCallback(async (bId: string, userId: string) => {
    if (boardsSource === 'boards') return;
    const sb = supabase as any;
    await sb.from('task_board_members').delete().eq('board_id', bId).eq('user_id', userId);
    await fetchMembers(bId);
  }, [fetchMembers, boardsSource]);

  useEffect(() => {
    void fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    if (boardId) {
      void fetchColumns(boardId);
      void fetchBoardTasks(boardId);
      void fetchMembers(boardId);
    }
  }, [boardId, fetchColumns, fetchBoardTasks, fetchMembers]);

  const board = useMemo(() => boards.find(b => b.id === boardId), [boards, boardId]);

  return {
    boards,
    board,
    columns,
    tasks,
    members,
    loading,
    boardsSource,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    fetchBoardTasks,
    reorderTask,
    fetchMembers,
    addMember,
    removeMember,
    moveColumn,
  };
}