import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrelloLayout } from '@/components/ui/trello-layout';
import { TrelloKanban } from '@/components/ui/trello-kanban';
import TaskFormModalWithBoard from '@/components/tarefas/TaskFormModalWithBoard';
import { TaskDetailsModal } from '@/components/tarefas/TaskDetailsModal';
import { FloatingTaskButton } from '@/components/tarefas/FloatingTaskButton';
import { useTarefasData } from '@/hooks/useTarefasData';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { TaskFormData, TarefaWithUser } from '@/types/tarefas';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BoardMember {
  user_id: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
}

export default function TrelloBoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { board, boards } = useTaskBoards(boardId);
  const {
    tarefas,
    loading: tasksLoading,
    createTarefa,
    updateTarefa,
    archiveTask,
    refreshTarefas,
    users,
  } = useTarefasData();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TarefaWithUser | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [members, setMembers] = useState<BoardMember[]>([]);

  // Filter tasks for this board
  const boardTasks = useMemo(() => {
    if (!boardId) return [];
    return tarefas.filter(task => task.board_id === boardId);
  }, [tarefas, boardId]);

  // Fetch board members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!boardId) return;

      try {
        // Get unique users who have tasks in this board
        const uniqueUserIds = [...new Set(
          boardTasks
            .map(task => task.responsavel_id)
            .filter(Boolean)
        )];

        if (uniqueUserIds.length === 0) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, avatar_url')
          .in('user_id', uniqueUserIds)
          .eq('is_active', true);

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching board members:', error);
      }
    };

    fetchMembers();
  }, [boardId, boardTasks]);

  if (!boardId) {
    navigate('/tarefas');
    return null;
  }

  if (!board) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando quadro...</p>
        </div>
      </div>
    );
  }

  const handleTaskCreate = async (taskData: TaskFormData) => {
    try {
      // Ensure the task is created with the correct board and column
      await createTarefa({
        ...taskData,
        board_id: boardId,
        column_id: selectedColumnId,
      });
      setShowTaskModal(false);
      setSelectedColumnId('');
      await refreshTarefas();
      
      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi criada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa',
        variant: 'destructive',
      });
    }
  };

  const handleTaskUpdate = async (taskId: string, newColumnId: string, newOrder: number) => {
    try {
      await updateTarefa(taskId, {
        column_id: newColumnId,
        ordem_na_coluna: newOrder,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível mover a tarefa',
        variant: 'destructive',
      });
    }
  };

  const handleTaskCreateFromColumn = (columnId: string) => {
    setSelectedColumnId(columnId);
    setShowTaskModal(true);
  };

  const handleTaskClick = (task: TarefaWithUser) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleTaskEdit = (task: TarefaWithUser) => {
    setSelectedTask(task);
    setShowTaskDetails(false);
    setShowTaskModal(true);
  };

  const handleTaskClose = async (task: TarefaWithUser) => {
    try {
      await archiveTask(task.id);
      toast({
        title: 'Tarefa arquivada',
        description: 'A tarefa foi arquivada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao arquivar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível arquivar a tarefa',
        variant: 'destructive',
      });
    }
  };

  return (
    <TrelloLayout
      boardName={board.name}
      boardId={board.id}
      members={members}
    >
      <TrelloKanban
        boardId={boardId}
        tasks={boardTasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskCreate={handleTaskCreateFromColumn}
        onTaskClick={handleTaskClick}
        onTaskClose={handleTaskClose}
        loading={tasksLoading}
      />

      {/* Floating Action Button */}
      <FloatingTaskButton
        onTaskCreate={handleTaskCreate}
        users={users}
        contextData={{
          modulo_origem: 'geral',
        }}
      />

      {/* Task Creation Modal */}
      <TaskFormModalWithBoard
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        onSubmit={handleTaskCreate}
        onUpdate={updateTarefa}
        users={users}
        editData={selectedTask}
        contextData={{
          board_id: boardId,
          column_id: selectedColumnId || undefined
        }}
        defaultValues={{
          board_id: boardId!,
          column_id: selectedColumnId || undefined
        }}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={showTaskDetails}
        onOpenChange={setShowTaskDetails}
        tarefa={selectedTask}
        onEdit={handleTaskEdit}
        onUpdate={async (id, updates) => {
          await updateTarefa(id, updates);
        }}
      />
    </TrelloLayout>
  );
}