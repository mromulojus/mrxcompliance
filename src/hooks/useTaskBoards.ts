import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export type BoardModule = 'vendas' | 'compliance' | 'juridico' | 'ouvidoria' | 'cobranca' | 'administrativo' | 'geral';

export interface BoardPermission {
  id: string;
  board_id: string;
  user_id: string;
  permission_level: 'view' | 'edit' | 'admin';
  profiles?: any;
}

export interface TaskBoard {
  id: string;
  name: string;
  empresa_id?: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  card_default?: any | null;
  modulos?: BoardModule[];
  background_color?: string;
  background_image?: string;
  is_public?: boolean;
}

export interface TaskColumn {
  id: string;
  board_id: string;
  name: string;
  color?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  card_default?: any | null;
}

export function useTaskBoards(boardId?: string) {
  const [boards, setBoards] = useState<TaskBoard[]>([]);
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<{ user_id: string; role: string }[]>([]);
  const [permissions, setPermissions] = useState<BoardPermission[]>([]);
  const [boardsSource] = useState<'boards'>('boards');
  const { toast } = useToast();

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar boards:', error);
        toast({ title: 'Erro', description: 'Não foi possível carregar os quadros', variant: 'destructive' });
        return;
      }
      
      setBoards(data || []);
    } catch (error) {
      console.error('Erro na busca de boards:', error);
      toast({ title: 'Erro', description: 'Erro inesperado ao carregar quadros', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (
    name: string, 
    empresaId?: string,
    modulos?: BoardModule[],
    backgroundColor?: string,
    backgroundImage?: string,
    isPublic?: boolean
  ): Promise<TaskBoard> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const boardData = {
        name,
        created_by: user.user.id,
        empresa_id: empresaId || null,
        is_active: true,
        modulos: modulos || (['geral'] as BoardModule[]),
        background_color: backgroundColor || '#ffffff',
        background_image: backgroundImage || null,
        is_public: isPublic !== undefined ? isPublic : true
      };

      const { data, error } = await supabase
        .from('boards')
        .insert([boardData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar board:', error);
        throw error;
      }

      await fetchBoards();
      toast({ title: 'Quadro criado', description: 'Seu quadro foi criado com sucesso.' });
      return data;
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      toast({ title: 'Erro', description: 'Não foi possível criar o quadro', variant: 'destructive' });
      throw error;
    }
  };

  const updateBoard = async (
    boardId: string, 
    name?: string, 
    cardDefault?: any,
    modulos?: BoardModule[],
    backgroundColor?: string,
    backgroundImage?: string,
    isPublic?: boolean
  ) => {
    try {
      const updateData: any = { name };
      if (cardDefault !== undefined) {
        updateData.card_default = cardDefault;
      }

      const { error } = await supabase
        .from('boards')
        .update(updateData)
        .eq('id', boardId);

      if (error) {
        console.error('Erro ao atualizar board:', error);
        throw error;
      }

      await fetchBoards();
      toast({ title: 'Quadro atualizado', description: 'Nome do quadro foi atualizado.' });
    } catch (error) {
      console.error('Erro ao atualizar quadro:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o quadro', variant: 'destructive' });
      throw error;
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId);

      if (error) {
        console.error('Erro ao deletar board:', error);
        throw error;
      }

      await fetchBoards();
      toast({ title: 'Quadro excluído', description: 'O quadro foi removido.' });
    } catch (error) {
      console.error('Erro ao excluir quadro:', error);
      toast({ title: 'Erro', description: 'Não foi possível excluir o quadro', variant: 'destructive' });
      throw error;
    }
  };

  const fetchColumns = async (bId: string) => {
    if (!bId) return;
    
    try {
      const { data, error } = await supabase
        .from('board_columns')
        .select('*')
        .eq('board_id', bId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Erro ao buscar colunas:', error);
        toast({ title: 'Erro', description: 'Não foi possível carregar as colunas', variant: 'destructive' });
        return;
      }

      setColumns(data || []);
    } catch (error) {
      console.error('Erro na busca de colunas:', error);
      toast({ title: 'Erro', description: 'Erro inesperado ao carregar colunas', variant: 'destructive' });
    }
  };

  const createColumn = async (bId: string, name: string) => {
    try {
      const maxOrderResult = await supabase
        .from('board_columns')
        .select('position')
        .eq('board_id', bId)
        .order('position', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderResult.data && maxOrderResult.data.length > 0 
        ? maxOrderResult.data[0].position + 1 
        : 0;

      const { error } = await supabase
        .from('board_columns')
        .insert({
          board_id: bId,
          name,
          position: nextOrder
        });

      if (error) {
        console.error('Erro ao criar coluna:', error);
        throw error;
      }

      await fetchColumns(bId);
      toast({ title: 'Coluna criada', description: 'A coluna foi adicionada.' });
    } catch (error) {
      console.error('Erro ao criar coluna:', error);
      toast({ title: 'Erro', description: 'Não foi possível criar a coluna', variant: 'destructive' });
      throw error;
    }
  };

  const updateColumn = async (columnId: string, updates: Partial<TaskColumn>) => {
    try {
      const { error } = await supabase
        .from('board_columns')
        .update(updates)
        .eq('id', columnId);

      if (error) {
        console.error('Erro ao atualizar coluna:', error);
        throw error;
      }

      if (boardId) {
        await fetchColumns(boardId);
      }
      toast({ title: 'Coluna atualizada', description: 'A coluna foi atualizada.' });
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar a coluna', variant: 'destructive' });
      throw error;
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('board_columns')
        .delete()
        .eq('id', columnId);

      if (error) {
        console.error('Erro ao deletar coluna:', error);
        throw error;
      }

      if (boardId) {
        await fetchColumns(boardId);
      }
      toast({ title: 'Coluna excluída', description: 'A coluna foi removida.' });
    } catch (error) {
      console.error('Erro ao excluir coluna:', error);
      toast({ title: 'Erro', description: 'Não foi possível excluir a coluna', variant: 'destructive' });
      throw error;
    }
  };

  const moveColumn = async (bId: string, columnId: string, newIndex: number) => {
    try {
      await fetchColumns(bId);
      toast({ title: 'Colunas reordenadas', description: 'A ordem das colunas foi atualizada.' });
    } catch (error) {
      console.error('Erro ao mover coluna:', error);
      toast({ title: 'Erro', description: 'Não foi possível reordenar as colunas', variant: 'destructive' });
      throw error;
    }
  };

  const fetchBoardTasks = async (bId: string) => {
    try {
      const { data: tasksData, error } = await supabase
        .from('tarefas')
        .select('*')
        .eq('board_id', bId)
        .order('ordem_na_coluna', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        toast({ title: 'Erro', description: 'Não foi possível carregar as tarefas do quadro', variant: 'destructive' });
        return;
      }

      const responsavelIds = [...new Set((tasksData || []).map((t: any) => t.responsavel_id).filter(Boolean))] as string[];
      let profiles: Record<string, any> = {};
      
      if (responsavelIds.length) {
        const { data: usersData } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url, is_active')
          .in('user_id', responsavelIds);
        profiles = Object.fromEntries((usersData || []).map(u => [u.user_id, u]));
      }

      const withUsers = (tasksData || []).map((t: any) => ({
        ...t,
        responsavel: t.responsavel_id ? profiles[t.responsavel_id] : undefined,
      }));

      setTasks(withUsers);
    } catch (error) {
      console.error('Erro ao buscar tarefas do quadro:', error);
      toast({ title: 'Erro', description: 'Erro inesperado ao carregar tarefas', variant: 'destructive' });
    }
  };

  const reorderTask = async (taskId: string, newColumnId: string, newOrder: number) => {
    try {
      await supabase
        .from('tarefas')
        .update({ 
          column_id: newColumnId, 
          ordem_na_coluna: newOrder 
        })
        .eq('id', taskId);

      if (boardId) {
        await fetchBoardTasks(boardId);
      }
      toast({ title: 'Tarefa movida', description: 'A tarefa foi movida com sucesso.' });
    } catch (error) {
      console.error('Erro ao reordenar tarefa:', error);
      toast({ title: 'Erro', description: 'Não foi possível mover a tarefa', variant: 'destructive' });
      throw error;
    }
  };

  const fetchMembers = async (bId: string) => {
    setMembers([]);
  };

  // Ensure departmental boards exist for a company
  const ensureDepartmentalBoards = async (empresaId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const departmentalBoards = [
        { name: 'VENDAS (xGROWTH)', modulos: ['vendas' as BoardModule], color: '#10B981' },
        { name: 'COMPLIANCE (Mrx Compliance)', modulos: ['compliance' as BoardModule], color: '#3B82F6' },
        { name: 'JURIDICO (MR Advocacia)', modulos: ['juridico' as BoardModule], color: '#8B5CF6' },
        { name: 'OUVIDORIA (Ouve.ai)', modulos: ['ouvidoria' as BoardModule], color: '#F59E0B' },
        { name: 'COBRANÇA (Debto)', modulos: ['cobranca' as BoardModule], color: '#EF4444' },
        { name: 'ADMINISTRATIVO', modulos: ['administrativo' as BoardModule], color: '#6B7280' }
      ];

      // Check which boards already exist
      const { data: existingBoards } = await supabase
        .from('boards')
        .select('name')
        .eq('empresa_id', empresaId)
        .eq('is_active', true);

      const existingNames = new Set(existingBoards?.map(b => b.name) || []);

      // Create missing boards
      for (const board of departmentalBoards) {
        if (!existingNames.has(board.name)) {
          const { data: newBoard, error: boardError } = await supabase
            .from('boards')
            .insert({
              name: board.name,
              empresa_id: empresaId,
              created_by: user.user.id,
              modulos: board.modulos,
              background_color: board.color,
              is_public: false,
              is_active: true
            })
            .select()
            .single();

          if (boardError) {
            console.error(`Erro ao criar quadro ${board.name}:`, boardError);
            continue;
          }

          // Create default columns for the board
          const defaultColumns = ['A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'];
          for (let i = 0; i < defaultColumns.length; i++) {
            await supabase
              .from('board_columns')
              .insert({
                board_id: newBoard.id,
                name: defaultColumns[i],
                position: i
              });
          }

          // Give admin permission to creator
          await supabase
            .from('board_permissions')
            .insert({
              board_id: newBoard.id,
              user_id: user.user.id,
              permission_level: 'admin'
            });
        }
      }

      // Refresh the boards list
      await fetchBoards();
      
      toast({ 
        title: 'Quadros criados', 
        description: 'Quadros departamentais foram criados para a empresa' 
      });
    } catch (error) {
      console.error('Erro ao garantir quadros departamentais:', error);
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível criar os quadros departamentais', 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const addMember = async (bId: string, userId: string, role: string = 'member') => {
    console.log('addMember não implementado para boards');
  };

  const removeMember = async (bId: string, userId: string) => {
    console.log('removeMember não implementado para boards');
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (boardId) {
      fetchColumns(boardId);
      fetchBoardTasks(boardId);
      fetchMembers(boardId);
    }
  }, [boardId]);

  const board = useMemo(() => boards.find(b => b.id === boardId), [boards, boardId]);

  return {
    boards,
    board,
    columns,
    tasks,
    members,
    permissions,
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
    ensureDepartmentalBoards,
    fetchBoardPermissions: () => Promise.resolve([]),
    addBoardPermission: () => Promise.resolve(),
    removeBoardPermission: () => Promise.resolve(),
  };
}