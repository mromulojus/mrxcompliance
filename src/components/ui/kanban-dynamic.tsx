"use client";

import React, { DragEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TarefaWithUser } from '@/types/tarefas';

export type DynamicColumn = {
  id: string;
  name: string;
  color?: string | null;
};

interface KanbanDynamicProps {
  columns: DynamicColumn[];
  tasks: TarefaWithUser[];
  onTaskUpdate: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onCreateTask?: (columnId: string) => void;
  hideCards?: boolean;
}

export const KanbanDynamic = ({ columns, tasks, onTaskUpdate, onTaskClick, onCreateTask, hideCards = false }: KanbanDynamicProps) => {
  return (
    <div className="flex h-full w-full gap-3 p-4 overflow-x-auto">
      {columns.map(col => (
        <Column
          key={col.id}
          title={col.name}
          columnId={col.id}
          headingColor={col.color || ''}
          tasks={tasks}
          onTaskUpdate={onTaskUpdate}
          onTaskClick={onTaskClick}
          onCreateTask={onCreateTask}
          hideCards={hideCards}
        />
      ))}
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor?: string;
  tasks: TarefaWithUser[];
  columnId: string;
  onTaskUpdate: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onCreateTask?: (columnId: string) => void;
  hideCards: boolean;
};

const Column = ({ title, headingColor, tasks, columnId, onTaskUpdate, onTaskClick, onCreateTask, hideCards }: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, task: TarefaWithUser) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleDragEnd = (e: DragEvent) => {
    const taskId = e.dataTransfer.getData('taskId');
    setActive(false);
    clearHighlights();
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || '-1';

    if (!taskId) return;

    if (before !== taskId) {
      const filteredTasks = tasks.filter(t => t.column_id === columnId);
      const moveToBack = before === '-1';
      let newOrder = 0;
      if (moveToBack) {
        newOrder = filteredTasks.length;
      } else {
        const insertAtIndex = filteredTasks.findIndex(el => el.id === before);
        newOrder = insertAtIndex >= 0 ? insertAtIndex : 0;
      }
      onTaskUpdate(taskId, columnId, newOrder);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = '0';
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = '1';
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: indicators[indicators.length - 1] }
    );
    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${columnId}"]`) as unknown as HTMLElement[]);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredTasks = tasks.filter(t => t.column_id === columnId);

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium`} style={{ color: headingColor || undefined }}>{title}</h3>
        <Badge variant="secondary" className="text-xs">{filteredTasks.length}</Badge>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex-1 min-h-0 w-full overflow-y-auto transition-colors rounded-lg ${active ? 'bg-neutral-300/60' : 'bg-neutral-200'} min-h-[360px] border-2 border-dashed ${active ? 'border-primary' : 'border-neutral-300'}`}
      >
        {onCreateTask && (
          <motion.button
            layout
            onClick={() => onCreateTask(columnId)}
            className="sticky top-0 z-10 mb-2 flex w-full items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 rounded-lg bg-neutral-300/80 hover:bg-neutral-300 backdrop-blur"
          >
            <span>Adicionar tarefa</span>
          </motion.button>
        )}
        {!hideCards && filteredTasks
          .sort((a, b) => (a.ordem_na_coluna || 0) - (b.ordem_na_coluna || 0))
          .map(task => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} onDragStart={handleDragStart} />
          ))}
        <DropIndicator beforeId={null} columnId={columnId} />
      </div>
    </div>
  );
};

type TaskCardProps = {
  task: TarefaWithUser;
  onDragStart: (e: DragEvent, task: TarefaWithUser) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
};

const TaskCard = ({ task, onDragStart, onTaskClick }: TaskCardProps) => {
  const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date();
  return (
    <>
      <DropIndicator beforeId={task.id} columnId={task.column_id as string} />
      <motion.div
        layout
        layoutId={task.id}
        draggable="true"
        onDragStart={(e: any) => onDragStart(e, task)}
        onClick={() => onTaskClick?.(task)}
        className="cursor-grab rounded-lg border border-neutral-300 bg-white text-neutral-800 shadow-sm p-4 mb-3 active:cursor-grabbing hover:shadow-md transition-all hover:border-primary/50"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium text-sm flex-1 line-clamp-2">{task.titulo}</h4>
            {task.responsavel ? (
              <Avatar className="h-6 w-6 border-2 border-background shadow-sm">
                <AvatarImage src={task.responsavel.avatar_url} />
                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                  {(task.responsavel.full_name || task.responsavel.username)?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          {task.descricao && <p className="text-xs text-muted-foreground line-clamp-2">{task.descricao}</p>}
          {task.data_vencimento && (
            <div className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

type DropIndicatorProps = { beforeId: string | null; columnId: string };
const DropIndicator = ({ beforeId, columnId }: DropIndicatorProps) => (
  <div data-before={beforeId || '-1'} data-column={columnId} className="my-0.5 h-0.5 w-full bg-primary opacity-0 transition-opacity" />
);

