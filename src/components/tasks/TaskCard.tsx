import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';

type Props = {
  task: Task;
  isDragging?: boolean;
  onDoubleClick?: () => void;
};

const priorityBadgeClass: Record<Task['priority'], string> = {
  ALTA: 'bg-red-100 text-red-700',
  MEDIA: 'bg-yellow-100 text-yellow-700',
  BAIXA: 'bg-green-100 text-green-700',
};

const originLabel: Record<Task['originModule'], string> = {
  OUVIDORIA: 'Ouvidoria',
  AUDITORIA: 'Auditoria',
  COBRANCAS: 'Cobranças',
};

export const TaskCard: React.FC<Props> = ({ task, isDragging, onDoubleClick }) => {
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
  return (
    <Card
      onDoubleClick={onDoubleClick}
      className={cn(
        'p-3 bg-white rounded-lg shadow-sm transition-transform hover:shadow-md cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-80 rotate-1'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate" title={task.title}>{task.title}</div>
          {task.empresaId && (
            <div className="text-xs text-muted-foreground truncate">Empresa: {task.empresaId}</div>
          )}
        </div>
        <Avatar className="h-7 w-7">
          <AvatarImage alt="Responsável" />
        </Avatar>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge className={priorityBadgeClass[task.priority]}>
          {task.priority === 'ALTA' ? '🔴 Alta' : task.priority === 'MEDIA' ? '🟡 Média' : '🟢 Baixa'}
        </Badge>
        <Badge variant="secondary" className={cn(isOverdue && 'bg-red-100 text-red-700 border-red-200')}>
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sem vencimento'}
        </Badge>
        <Badge variant="outline">{originLabel[task.originModule]}</Badge>
      </div>
    </Card>
  );
};

