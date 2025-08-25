import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTarefasData } from '@/hooks/useTarefasDataNew';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import TaskFormModalWithBoard from '@/components/tarefas/TaskFormModalWithBoard';
import { TaskDetailsModal } from '@/components/tarefas/TaskDetailsModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Plus, 
  Eye, 
  Users, 
  Calendar,
  ChevronRight,
  Kanban
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityColors = {
  alta: 'bg-red-500',
  media: 'bg-yellow-500', 
  baixa: 'bg-green-500'
};

const statusLabels = {
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento',
  em_revisao: 'Em Revisão',
  concluido: 'Concluído'
};

export default function TarefasDashboardNewWithBoards() {
  const { 
    tarefas, 
    users, 
    loading, 
    createTarefa, 
    updateTarefa,
    calculateKPIs 
  } = useTarefasData();
  
  const { boards } = useTaskBoards();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Calculate KPIs
  const kpis = useMemo(() => calculateKPIs(tarefas), [tarefas, calculateKPIs]);

  // Recent tasks (last 10)
  const recentTasks = useMemo(() => {
    return tarefas
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [tarefas]);

  // Group tasks by board
  const tasksByBoard = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    tarefas.forEach(task => {
      if (task.board_id) {
        if (!groups[task.board_id]) {
          groups[task.board_id] = [];
        }
        groups[task.board_id].push(task);
      }
    });
    
    return groups;
  }, [tarefas]);

  const handleTaskCreate = async (taskData: any) => {
    try {
      await createTarefa(taskData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  const handleTaskView = (task: any) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Tarefas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas tarefas por quadros e acompanhe o progresso
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
            <Button variant="outline" asChild>
              <Link to="/tarefas/quadros">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Ver Quadros
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">A Fazer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{kpis.a_fazer}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{kpis.em_andamento}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{kpis.em_revisao}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Concluído</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{kpis.concluido}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{kpis.atrasadas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Boards Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Boards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Kanban className="h-5 w-5" />
                Quadros Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {boards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Kanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum quadro encontrado</p>
                  <Button variant="outline" className="mt-2" asChild>
                    <Link to="/tarefas/quadros">
                      Criar primeiro quadro
                    </Link>
                  </Button>
                </div>
              ) : (
                boards.map((board) => {
                  const boardTaskCount = tasksByBoard[board.id]?.length || 0;
                  return (
                    <div key={board.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: board.background_color }}
                        />
                        <div>
                          <h4 className="font-medium">{board.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {boardTaskCount} tarefa{boardTaskCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/tarefas/quadros/${board.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tarefas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma tarefa encontrada</p>
                </div>
              ) : (
                recentTasks.map((task) => {
                  const board = boards.find(b => b.id === task.board_id);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={cn("w-2 h-2 rounded-full", priorityColors[task.prioridade as keyof typeof priorityColors])} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{task.titulo}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {board && (
                              <>
                                <span>{board.name}</span>
                                <ChevronRight className="h-3 w-3" />
                              </>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {statusLabels[task.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                        </div>
                        {task.responsavel && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.responsavel.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {task.responsavel.full_name?.charAt(0) || task.responsavel.username?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleTaskView(task)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskFormModalWithBoard
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleTaskCreate}
        users={users}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        tarefa={selectedTask}
        onEdit={() => {
          setShowDetailsModal(false);
          setShowCreateModal(true);
        }}
        onUpdate={async (id, updates) => {
          await updateTarefa(id, updates);
        }}
      />
    </div>
  );
}