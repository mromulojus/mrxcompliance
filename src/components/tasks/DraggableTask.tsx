import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task } from '@/types/task';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  task: Task;
  children: (isDragging: boolean) => React.ReactNode;
};

export const DraggableTask: React.FC<Props> = ({ task, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = {
    transform: CSS.Translate.toString(transform),
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children(isDragging)}
    </div>
  );
};

