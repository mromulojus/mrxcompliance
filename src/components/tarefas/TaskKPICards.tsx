import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  ListTodo,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { TaskKPIs } from '@/types/tarefas';

interface TaskKPICardsProps {
  kpis: TaskKPIs;
}

export function TaskKPICards({ kpis }: TaskKPICardsProps) {
  const cards = [
    {
      title: 'Total de Tarefas',
      value: kpis.total,
      icon: ListTodo,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'A Fazer',
      value: kpis.a_fazer,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Em Andamento',
      value: kpis.em_andamento,
      icon: PlayCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Em Revisão',
      value: kpis.em_revisao,
      icon: PauseCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Concluídas',
      value: kpis.concluido,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Atrasadas',
      value: kpis.atrasadas,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Vencendo Hoje',
      value: kpis.vencendo_hoje,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {(card.title === 'Atrasadas' && card.value > 0) && (
                <Badge variant="destructive" className="mt-1">
                  Requer atenção
                </Badge>
              )}
              {(card.title === 'Vencendo Hoje' && card.value > 0) && (
                <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-600">
                  Urgente
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}