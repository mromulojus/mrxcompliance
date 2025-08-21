import React, { useState, useMemo } from 'react';
import { KanbanSquare, LayoutGrid, Filter, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Kanban } from '@/components/ui/kanban-new';
import { DepartmentalKanban } from '@/components/ui/kanban-departmental';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TaskFiltersComponent } from '@/components/tarefas/TaskFiltersNew';
import { TaskFormModal } from '@/components/tarefas/TaskFormModalNew';
import { TaskDetailsModal } from '@/components/tarefas/TaskDetailsModal';
import { FloatingTaskButton } from '@/components/tarefas/FloatingTaskButton';
import { BoardSelector } from '@/components/tarefas/BoardSelector';
import { useTarefasData } from '@/hooks/useTarefasData';
import { TaskFilters, TaskFormData, TaskStatus, TarefaWithUser } from '@/types/tarefas';
import { useToast } from '@/hooks/use-toast';

export default function TarefasDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<'kanban' | 'grid'>('kanban');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TarefaWithUser | null>(null);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<TaskStatus>('a_fazer');
  const [selectedBoardId, setSelectedBoardId] = useState<string | undefined>();

  const {
    tarefas,
    loading,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    archiveTask,
    updateTarefas,
    filterTarefas,
    refreshTarefas,
  } = useTarefasData();

  // Mock users data since not available in hook
  const users = [];

  // Apply filters and board selection
  const filteredTarefas = useMemo(() => {
    let filtered = filterTarefas(tarefas, filters);
    
    // Only filter by board if explicitly selected and not the default board
    // For now, show all tasks when no specific departmental board is selected
    if (selectedBoardId && selectedBoardId !== 'default') {
      filtered = filtered.filter(tarefa => tarefa.board_id === selectedBoardId);
    }
    
    return filtered;
  }, [tarefas, filters, selectedBoardId, filterTarefas]);

  console.log('Debug TarefasDashboard:', {
    tarefasCount: tarefas.length,
    filters,
    filteredTarefasCount: filteredTarefas.length,
    loading,
    selectedBoardId
  });

  

  const handleTaskCreate = async (taskData: TaskFormData) => {
    await createTarefa(taskData);
    setShowTaskModal(false);
  };

  const handleTaskCreateFromColumn = (moduleTypeOrStatus: string) => {
    if (['a_fazer', 'em_andamento', 'em_revisao', 'concluido'].includes(moduleTypeOrStatus)) {
      // Traditional kanban status
      setSelectedColumnStatus(moduleTypeOrStatus as TaskStatus);
    }
    setShowTaskModal(true);
  };

  const handleTaskUpdate = async (taskId: string, newColumnIdOrStatus: string, newOrder: number) => {
    try {
      // Check if we're dealing with column IDs (departmental boards) or status (traditional kanban)
      const task = tarefas.find(t => t.id === taskId);
      if (!task) return;

      // If it's a UUID (column_id), update with column and order
      const isColumnId = newColumnIdOrStatus.includes('-');
      
      if (isColumnId) {
        await updateTarefa(taskId, { 
          column_id: newColumnIdOrStatus, 
          ordem_na_coluna: newOrder 
        });
      } else {
        // Traditional status update
        await updateTarefa(taskId, { 
          status: newColumnIdOrStatus as TaskStatus, 
          ordem_na_coluna: newOrder 
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskClose = async (task: TarefaWithUser) => {
    try {
      await archiveTask(task.id);
      toast({
        title: 'Tarefa arquivada',
        description: 'A tarefa foi arquivada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao arquivar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível arquivar a tarefa',
        variant: 'destructive'
      });
    }
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

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Organize e acompanhe suas tarefas em formato Kanban
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Removido botão "Ver Quadros" em favor do botão Grade */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTarefas}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <div className="flex rounded-md border">
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
              className="rounded-r-none"
            >
              <KanbanSquare className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tarefas/quadros')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grade
            </Button>
          </div>
        </div>
      </div>

      {/* Board Selector */}
      <BoardSelector
        selectedBoardId={selectedBoardId}
        onBoardChange={setSelectedBoardId}
        empresaId={filters.empresa}
        selectedModule={filters.modulo}
        onModuleChange={(module) => setFilters({...filters, modulo: module})}
      />

      {/* Filters */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <TaskFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            users={users}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Main Content */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KanbanSquare className="h-5 w-5" />
            Quadro de Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {view === 'kanban' ? (
            <div className="h-[calc(100vh-480px)] min-h-[520px]">
              <DepartmentalKanban
                tasks={filteredTarefas}
                selectedModulo={filters.modulo}
                selectedEmpresa={filters.empresa}
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreateFromColumn}
                onTaskClick={handleTaskClick}
                onTaskClose={handleTaskClose}
                loading={loading}
              />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Responsável:</span>
                <Select
                  value={filters.responsavel || 'all'}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      responsavel: value === 'all' ? undefined : value,
                    });
                  }}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Escolher responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="unassigned">Não atribuídas</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.full_name || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[calc(100vh-480px)] min-h-[520px]">
                <Kanban
                  tasks={filteredTarefas}
                  onTaskUpdate={(taskId, status, order) => handleTaskUpdate(taskId, status, order)}
                  onTaskCreate={handleTaskCreateFromColumn}
                  onTaskDelete={deleteTarefa}
                  onTaskClick={handleTaskClick}
                  onTaskClose={handleTaskClose}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <FloatingTaskButton
        onTaskCreate={handleTaskCreate}
        users={users}
        contextData={{
          modulo_origem: 'geral',
        }}
      />

      {/* Task Creation Modal */}
      <TaskFormModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        onSubmit={handleTaskCreate}
        users={users}
        defaultValues={{
          status: selectedColumnStatus,
          modulo_origem: 'geral',
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
    </div>
  );
}