import React, { useState, useMemo } from 'react';
import { KanbanSquare, LayoutGrid, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Kanban } from '@/components/ui/kanban-new';
import { TaskFiltersComponent } from '@/components/tarefas/TaskFiltersNew';
import { TaskFormModal } from '@/components/tarefas/TaskFormModalNew';
import { FloatingTaskButton } from '@/components/tarefas/FloatingTaskButton';
import { useTarefasData } from '@/hooks/useTarefasDataNew';
import { TaskFilters, TaskFormData, TaskStatus } from '@/types/tarefas';

export default function TarefasDashboard() {
  const [view, setView] = useState<'kanban' | 'grid'>('kanban');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<TaskStatus>('a_fazer');

  const {
    tarefas,
    users,
    loading,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    reorderTasks,
    filterTarefas,
    refreshTarefas,
  } = useTarefasData();

  const filteredTarefas = useMemo(() => {
    return filterTarefas(tarefas, filters);
  }, [tarefas, filters, filterTarefas]);

  

  const handleTaskCreate = async (taskData: TaskFormData) => {
    await createTarefa(taskData);
    setShowTaskModal(false);
  };

  const handleTaskCreateFromColumn = (columnStatus: TaskStatus) => {
    setSelectedColumnStatus(columnStatus);
    setShowTaskModal(true);
  };

  const handleTaskReorder = (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    reorderTasks(taskId, newStatus, newOrder);
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
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grade
            </Button>
          </div>
        </div>
      </div>

      

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
              <Kanban
                tasks={filteredTarefas}
                onTaskUpdate={handleTaskReorder}
                onTaskCreate={handleTaskCreateFromColumn}
                onTaskDelete={deleteTarefa}
                loading={loading}
                hideCards
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center text-muted-foreground">
                Visualização em grade será implementada em breve
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
    </div>
  );
}