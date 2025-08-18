import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/types/task';
import { useDroppable } from '@dnd-kit/core';

type Props = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onAdd?: () => void;
  renderDraggable: (task: Task) => React.ReactNode;
};

export const KanbanColumn: React.FC<Props> = ({ title, status, tasks, onAdd, renderDraggable }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${status}` });
  return (
    <div className="w-72 shrink-0 mr-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{title} <span className="text-muted-foreground">({tasks.length})</span></h3>
        <Button size="sm" variant="outline" onClick={onAdd}>+</Button>
      </div>
      <div ref={setNodeRef} className={isOver ? 'bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-md' : ''}>
        <ScrollArea className="h-[calc(100vh-210px)] pr-1">
          <div className="flex flex-col gap-2 py-1">
            {tasks.map((t) => (
              <div key={t.id}>{renderDraggable(t)}</div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

