import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KanbanSquare, Plus, ArrowRight, Users, Building } from 'lucide-react';
import { useTaskBoards } from '@/hooks/useTaskBoards';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuickStats {
  totalTasks: number;
  myTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
}

export default function TarefasDashboard() {
  const navigate = useNavigate();
  const { boards, createBoard } = useTaskBoards();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<QuickStats>({
    totalTasks: 0,
    myTasks: 0,
    overdueTasks: 0,
    completedThisWeek: 0,
  });
  const [generalBoard, setGeneralBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findOrCreateGeneralBoard = async () => {
      if (!profile?.empresa_ids?.[0]) {
        setLoading(false);
        return;
      }

      const empresaId = profile.empresa_ids[0];

      try {
        // Look for existing "Geral" board
        let board = boards.find(b => 
          b.empresa_id === empresaId && 
          (b.name === 'Geral' || b.name === 'ADMINISTRATIVO' || b.name === 'General')
        );

        // If no general board exists, create one
        if (!board) {
          board = await createBoard('Geral', empresaId);
          
          // Create default columns
          const defaultColumns = ['A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'];
          for (let i = 0; i < defaultColumns.length; i++) {
            await supabase
              .from('board_columns')
              .insert({
                board_id: board.id,
                name: defaultColumns[i],
                position: i,
              });
          }
        }

        setGeneralBoard(board);
      } catch (error) {
        console.error('Error finding/creating general board:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível acessar o quadro geral',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    findOrCreateGeneralBoard();
  }, [boards, profile, createBoard, toast]);

  // Fetch quick stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.user_id) return;

      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: tasks, error } = await supabase
          .from('tarefas')
          .select('*')
          .eq('is_archived', false);

        if (error) throw error;

        const now = new Date();
        const totalTasks = tasks?.length || 0;
        const myTasks = tasks?.filter(t => t.responsavel_id === profile.user_id).length || 0;
        const overdueTasks = tasks?.filter(t => 
          t.data_vencimento && new Date(t.data_vencimento) < now
        ).length || 0;
        const completedThisWeek = tasks?.filter(t => 
          t.status === 'concluido' && 
          t.data_conclusao && 
          new Date(t.data_conclusao) >= oneWeekAgo
        ).length || 0;

        setStats({
          totalTasks,
          myTasks,
          overdueTasks,
          completedThisWeek,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [profile]);

  const handleOpenGeneralBoard = () => {
    if (generalBoard) {
      navigate(`/tarefas/quadros/${generalBoard.id}`);
    }
  };

  const handleViewAllBoards = () => {
    navigate('/tarefas/quadros');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
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
            Organize suas tarefas em quadros estilo Trello
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleViewAllBoards} variant="outline">
            <KanbanSquare className="h-4 w-4 mr-2" />
            Ver Todos os Quadros
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <KanbanSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Tarefas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <Badge variant="destructive" className="text-xs">!</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas (7 dias)</CardTitle>
            <Badge variant="default" className="text-xs">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedThisWeek}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action - General Board */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Quadro Geral
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Acesse o quadro principal para gerenciar suas tarefas diárias
              </p>
            </div>
            <Button onClick={handleOpenGeneralBoard} disabled={!generalBoard}>
              Abrir Quadro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Recent Boards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quadros Recentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleViewAllBoards}>
              Ver todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.slice(0, 6).map((board) => (
              <Card 
                key={board.id} 
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20"
                onClick={() => navigate(`/tarefas/quadros/${board.id}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{board.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Atualizado em {new Date(board.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {/* Create new board card */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-all border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
              onClick={handleViewAllBoards}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center h-16">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-center">
                <p className="text-sm text-muted-foreground">
                  Criar novo quadro
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}