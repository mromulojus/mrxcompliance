import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface ActiveUsersRankingProps {
  users: Array<{
    name: string;
    completedTasks: number;
    totalTime: number;
  }>;
}

export function ActiveUsersRanking({ users }: ActiveUsersRankingProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankBadgeVariant = (position: number) => {
    if (position <= 3) return 'default';
    if (position <= 5) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Ranking de Usuários Mais Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user, index) => (
            <div 
              key={user.name} 
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getRankIcon(index + 1)}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.totalTime}h de atividade
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={getRankBadgeVariant(index + 1)}>
                  {user.completedTasks} tarefas
                </Badge>
                <Badge variant="outline">
                  #{index + 1}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum usuário ativo encontrado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}