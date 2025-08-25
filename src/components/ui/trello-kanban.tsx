import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrelloColumn } from "./trello-column";
import { TarefaWithUser } from "@/types/tarefas";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BoardColumn {
  id: string;
  name: string;
  position: number;
  board_id: string;
}

interface TrelloKanbanProps {
  boardId: string;
  tasks: TarefaWithUser[];
  onTaskUpdate: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskCreate: (columnId: string) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onTaskClose?: (task: TarefaWithUser) => void;
  loading?: boolean;
}

export const TrelloKanban: React.FC<TrelloKanbanProps> = ({
  boardId,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskClick,
  onTaskClose,
  loading = false,
}) => {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const { toast } = useToast();

  // Fetch columns for the board
  useEffect(() => {
    const fetchColumns = async () => {
      if (!boardId) return;

      try {
        const { data, error } = await supabase
          .from('board_columns')
          .select('*')
          .eq('board_id', boardId)
          .order('position', { ascending: true });

        if (error) throw error;
        setColumns(data || []);
      } catch (error) {
        console.error('Error fetching columns:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as colunas do quadro",
          variant: "destructive",
        });
      }
    };

    fetchColumns();
  }, [boardId, toast]);

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('board_columns')
        .insert({
          board_id: boardId,
          name: newColumnName.trim(),
          position: columns.length,
        })
        .select()
        .single();

      if (error) throw error;

      setColumns([...columns, data]);
      setNewColumnName("");
      setIsCreatingColumn(false);
      
      toast({
        title: "Coluna criada",
        description: `A coluna "${newColumnName}" foi criada com sucesso`,
      });
    } catch (error) {
      console.error('Error creating column:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a coluna",
        variant: "destructive",
      });
    }
  };

  const handleUpdateColumn = async (columnId: string, updates: { name?: string }) => {
    try {
      const { error } = await supabase
        .from('board_columns')
        .update(updates)
        .eq('id', columnId);

      if (error) throw error;

      setColumns(columns.map(col => 
        col.id === columnId ? { ...col, ...updates } : col
      ));

      toast({
        title: "Coluna atualizada",
        description: "A coluna foi atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating column:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coluna",
        variant: "destructive",
      });
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    // Check if column has tasks
    const columnTasks = tasks.filter(task => task.column_id === columnId);
    if (columnTasks.length > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma coluna que contém tarefas",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('board_columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      setColumns(columns.filter(col => col.id !== columnId));
      
      toast({
        title: "Coluna excluída",
        description: "A coluna foi excluída com sucesso",
      });
    } catch (error) {
      console.error('Error deleting column:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a coluna",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3 h-full overflow-x-auto overflow-y-hidden px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-2">
            <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="space-y-1.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-white rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="flex gap-3 h-full overflow-x-auto overflow-y-hidden px-2"
      style={{ 
        minHeight: 'calc(100vh - 180px)',
        maxHeight: 'calc(100vh - 180px)'
      }}
    >
      {/* Existing columns */}
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.column_id === column.id);
        
        return (
          <TrelloColumn
            key={column.id}
            id={column.id}
            title={column.name}
            tasks={columnTasks}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={onTaskCreate}
            onTaskClick={onTaskClick}
            onTaskClose={onTaskClose}
            onColumnUpdate={handleUpdateColumn}
            onColumnDelete={handleDeleteColumn}
          />
        );
      })}

      {/* Add column button */}
      <div className="flex-shrink-0 w-72">
        {isCreatingColumn ? (
          <div className="bg-gray-50 rounded-lg p-2">
            <input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Digite o nome da coluna"
              className="w-full p-2 rounded border focus:border-primary focus:outline-none mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateColumn();
                if (e.key === 'Escape') {
                  setIsCreatingColumn(false);
                  setNewColumnName("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateColumn} disabled={!newColumnName.trim()}>
                Adicionar coluna
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setIsCreatingColumn(false);
                  setNewColumnName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setIsCreatingColumn(true)}
            className="w-full h-fit justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 p-2 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar coluna
          </Button>
        )}
      </div>
    </div>
  );
};
