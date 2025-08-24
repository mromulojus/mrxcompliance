import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/hr/StatCard';
import { useUserStats } from '@/hooks/useUserStats';
import { Clock, Trophy, Activity, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function UserStatsSection() {
  const { stats, loading } = useUserStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Estatísticas Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Estatísticas Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            titulo="Dias no Sistema"
            valor={stats.daysSinceRegistration}
            icone="calendar"
            cor="primary"
          />
          
          <StatCard
            titulo="Total de Logins"
            valor={stats.totalLogins}
            icone="trending"
            cor="success"
          />
          
          <StatCard
            titulo="Taxa de Conclusão"
            valor={stats.taskCompletionRate}
            icone="shield"
            tipo="progress"
            cor="warning"
          />
          
          <StatCard
            titulo="Ranking Pessoal"
            valor={stats.personalRanking}
            icone="users"
            cor="danger"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Target className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Tarefas Concluídas</p>
              <p className="text-muted-foreground">{stats.completedTasks} de {stats.totalTasks}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Tempo Médio/Sessão</p>
              <p className="text-muted-foreground">{stats.averageSessionTime}h</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Trophy className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Posição no Ranking</p>
              <p className="text-muted-foreground">{stats.personalRanking}º de {stats.totalSystemUsers}</p>
            </div>
          </div>
        </div>

        {stats.lastActivity && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Último acesso:</strong> {new Date(stats.lastActivity).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}