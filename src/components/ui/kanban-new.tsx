"use client";

import React, {
  useState,
  DragEvent,
} from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TarefaWithUser, TaskStatus, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_MODULE_LABELS } from "@/types/tarefas";

interface KanbanProps {
  tasks: TarefaWithUser[];
  onTaskUpdate: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  onTaskCreate: (columnStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  loading?: boolean;
  /** When true, task cards are hidden (columns stay visible). */
  hideCards?: boolean;
}

export const Kanban = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete, loading = false, hideCards = false }: KanbanProps) => {
  return (
    <div className={cn("h-full w-full bg-transparent text-foreground")}>
      <Board 
        tasks={tasks}
        onTaskUpdate={onTaskUpdate}
        onTaskCreate={onTaskCreate}
        onTaskDelete={onTaskDelete}
        loading={loading}
        hideCards={hideCards}
      />
    </div>
  );
};

interface BoardProps {
  tasks: TarefaWithUser[];
  onTaskUpdate: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  onTaskCreate: (columnStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  loading: boolean;
  hideCards: boolean;
}

const Board = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete, loading, hideCards }: BoardProps) => {
  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: 'a_fazer', title: TASK_STATUS_LABELS.a_fazer, color: 'text-yellow-600' },
    { status: 'em_andamento', title: TASK_STATUS_LABELS.em_andamento, color: 'text-blue-600' },
    { status: 'em_revisao', title: TASK_STATUS_LABELS.em_revisao, color: 'text-purple-600' },
    { status: 'concluido', title: TASK_STATUS_LABELS.concluido, color: 'text-green-600' },
  ];

  if (loading) {
    return (
      <div className="flex h-full w-full gap-3 overflow-x-auto p-6">
        {columns.map((col) => (
          <div key={col.status} className="w-80 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`font-medium ${col.color}`}>{col.title}</h3>
              <div className="h-4 w-6 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-full w-full min-h-[500px] border-2 border-dashed border-transparent">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg p-4 mb-3 h-32" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full gap-3 overflow-x-auto p-6">
      {columns.map((col) => (
        <Column
          key={col.status}
          title={col.title}
          column={col.status}
          headingColor={col.color}
          tasks={tasks}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={onTaskCreate}
          hideCards={hideCards}
        />
      ))}
      {/* Lixeira removida para aumentar área útil do quadro */}
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  tasks: TarefaWithUser[];
  column: TaskStatus;
  onTaskUpdate: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  onTaskCreate: (columnStatus: TaskStatus) => void;
  hideCards: boolean;
};

const Column = ({
  title,
  headingColor,
  tasks,
  column,
  onTaskUpdate,
  onTaskCreate,
  hideCards,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, task: TarefaWithUser) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("currentStatus", task.status);
  };

  const handleDragEnd = (e: DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== taskId && currentStatus !== column) {
      const filteredTasks = tasks.filter((t) => t.status === column);
      const moveToBack = before === "-1";
      
      let newOrder = 0;
      if (moveToBack) {
        newOrder = filteredTasks.length;
      } else {
        const insertAtIndex = filteredTasks.findIndex((el) => el.id === before);
        newOrder = insertAtIndex >= 0 ? insertAtIndex : 0;
      }

      onTaskUpdate(taskId, column, newOrder);
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
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
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
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredTasks = tasks.filter((t) => t.status === column);

  return (
    <div className="w-80 shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {filteredTasks.length}
        </Badge>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors rounded-lg ${
          active ? "bg-neutral-300/60" : "bg-neutral-200"
        } min-h-[360px] border-2 border-dashed ${active ? "border-primary" : "border-neutral-300"}`}
      >
        {!hideCards && filteredTasks
          .sort((a, b) => a.ordem_na_coluna - b.ordem_na_coluna)
          .map((task) => (
            <TaskCard key={task.id} task={task} handleDragStart={handleDragStart} />
          ))}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} onTaskCreate={onTaskCreate} />
      </div>
    </div>
  );
};

type TaskCardProps = {
  task: TarefaWithUser;
  handleDragStart: (e: DragEvent, task: TarefaWithUser) => void;
};

const TaskCard = ({ task, handleDragStart }: TaskCardProps) => {
  const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'ouvidoria': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'auditoria': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cobrancas': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  return (
    <>
      <DropIndicator beforeId={task.id} column={task.status} />
      <motion.div
        layout
        layoutId={task.id}
        draggable="true"
        onDragStart={(e: any) => handleDragStart(e, task)}
        className="cursor-grab rounded-lg border border-neutral-300 bg-white text-neutral-800 shadow-sm p-4 mb-3 active:cursor-grabbing hover:shadow-md transition-all hover:border-primary/50 group"
      >
        <div className="space-y-3">
          {/* Header with title and avatar */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium text-sm flex-1 line-clamp-2 group-hover:text-primary transition-colors">
              {task.titulo}
            </h4>
            {task.responsavel ? (
              <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                <AvatarImage src={task.responsavel.avatar_url} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {task.responsavel.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 
                   task.responsavel.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          {task.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.descricao}
            </p>
          )}
          
          {/* Responsible user name */}
          {task.responsavel && (
            <p className="text-xs font-medium text-foreground/80">
              {task.responsavel.full_name || task.responsavel.username}
            </p>
          )}
          
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={`text-xs font-medium border ${getPriorityColor(task.prioridade)}`}
            >
              {TASK_PRIORITY_LABELS[task.prioridade]}
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`text-xs font-medium border ${getModuleColor(task.modulo_origem)}`}
            >
              {TASK_MODULE_LABELS[task.modulo_origem]}
            </Badge>
          </div>
          
          {/* Due date */}
          {task.data_vencimento && (
            <div className={`text-xs flex items-center gap-1 ${
              isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
            }`}>
              <span>📅</span>
              {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
              {isOverdue && <span className="text-red-500">⚠️</span>}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-primary opacity-0 transition-opacity"
    />
  );
};

const BurnBarrel = ({
  onTaskDelete,
}: {
  onTaskDelete: (taskId: string) => void;
}) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e: DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onTaskDelete(taskId);
    }
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl transition-all ${
        active
          ? "border-destructive bg-destructive/20 text-destructive scale-105"
          : "border-muted-foreground/50 bg-muted/20 text-muted-foreground hover:border-destructive/50"
      }`}
    >
      {active ? (
        <FaFire className="animate-bounce text-destructive" />
      ) : (
        <FiTrash className="transition-transform group-hover:scale-110" />
      )}
    </div>
  );
};

type AddCardProps = {
  column: TaskStatus;
  onTaskCreate: (columnStatus: TaskStatus) => void;
};

const AddCard = ({ column, onTaskCreate }: AddCardProps) => {
  return (
    <motion.button
      layout
      onClick={() => onTaskCreate(column)}
      className="flex w-full items-center gap-1.5 px-3 py-3 text-xs text-neutral-300 transition-colors hover:text-white rounded-lg hover:bg-neutral-700/50 border-2 border-dashed border-neutral-700 hover:border-primary/50"
    >
      <FiPlus className="h-4 w-4" />
      <span>Adicionar tarefa</span>
    </motion.button>
  );
};