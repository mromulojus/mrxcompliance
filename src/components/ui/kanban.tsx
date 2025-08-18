"use client";

import React, {
  Dispatch,
  SetStateAction,
  useState,
  DragEvent,
  FormEvent,
} from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Tarefa, TaskStatus, TASK_STATUS_LABELS } from "@/types/tarefas";

interface KanbanProps {
  tasks: Tarefa[];
  onTaskUpdate: (tasks: Tarefa[]) => void;
  onTaskCreate: (columnStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
}

export const Kanban = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: KanbanProps) => {
  return (
    <div className={cn("h-full w-full bg-background text-foreground")}>
      <Board 
        tasks={tasks}
        onTaskUpdate={onTaskUpdate}
        onTaskCreate={onTaskCreate}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );
};

interface BoardProps {
  tasks: Tarefa[];
  onTaskUpdate: (tasks: Tarefa[]) => void;
  onTaskCreate: (columnStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
}

const Board = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: BoardProps) => {
  return (
    <div className="flex h-full w-full gap-3 overflow-x-auto p-6">
      <Column
        title={TASK_STATUS_LABELS.a_fazer}
        column="a_fazer"
        headingColor="text-yellow-600"
        tasks={tasks}
        setTasks={onTaskUpdate}
        onTaskCreate={onTaskCreate}
      />
      <Column
        title={TASK_STATUS_LABELS.em_andamento}
        column="em_andamento"
        headingColor="text-blue-600"
        tasks={tasks}
        setTasks={onTaskUpdate}
        onTaskCreate={onTaskCreate}
      />
      <Column
        title={TASK_STATUS_LABELS.em_revisao}
        column="em_revisao"
        headingColor="text-purple-600"
        tasks={tasks}
        setTasks={onTaskUpdate}
        onTaskCreate={onTaskCreate}
      />
      <Column
        title={TASK_STATUS_LABELS.concluido}
        column="concluido"
        headingColor="text-green-600"
        tasks={tasks}
        setTasks={onTaskUpdate}
        onTaskCreate={onTaskCreate}
      />
      <BurnBarrel onTaskDelete={onTaskDelete} />
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  tasks: Tarefa[];
  column: TaskStatus;
  setTasks: Dispatch<SetStateAction<Tarefa[]>>;
  onTaskCreate: (columnStatus: TaskStatus) => void;
};

const Column = ({
  title,
  headingColor,
  tasks,
  column,
  setTasks,
  onTaskCreate,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent, task: Tarefa) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleDragEnd = (e: DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== taskId) {
      let copy = [...tasks];

      let taskToTransfer = copy.find((t) => t.id === taskId);
      if (!taskToTransfer) return;
      taskToTransfer = { ...taskToTransfer, status: column };

      copy = copy.filter((t) => t.id !== taskId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(taskToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, taskToTransfer);
      }

      setTasks(copy);
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
        <span className="rounded text-sm text-muted-foreground">
          {filteredTasks.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors rounded-lg ${
          active ? "bg-muted/50" : "bg-background"
        } min-h-[500px] border-2 border-dashed ${active ? "border-primary" : "border-transparent"}`}
      >
        {filteredTasks.map((task) => {
          return <TaskCard key={task.id} task={task} handleDragStart={handleDragStart} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} onTaskCreate={onTaskCreate} />
      </div>
    </div>
  );
};

type TaskCardProps = {
  task: Tarefa;
  handleDragStart: Function;
};

const TaskCard = ({ task, handleDragStart }: TaskCardProps) => {
  const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date();
  
  return (
    <>
      <DropIndicator beforeId={task.id} column={task.status} />
      <motion.div
        layout
        layoutId={task.id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, task)}
        className="cursor-grab rounded-lg border bg-card text-card-foreground shadow-sm p-4 mb-3 active:cursor-grabbing hover:shadow-md transition-shadow"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm flex-1">{task.titulo}</h4>
            {task.responsavel_id && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {task.responsavel_id.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          {task.descricao && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.descricao}</p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.prioridade === 'alta' ? 'bg-red-100 text-red-600' :
              task.prioridade === 'media' ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              {task.prioridade === 'alta' ? '🔴 Alta' :
               task.prioridade === 'media' ? '🟡 Média' : '🟢 Baixa'}
            </span>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              task.modulo_origem === 'ouvidoria' ? 'bg-purple-100 text-purple-600' :
              task.modulo_origem === 'auditoria' ? 'bg-blue-100 text-blue-600' :
              task.modulo_origem === 'cobrancas' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {task.modulo_origem === 'ouvidoria' ? 'Ouvidoria' :
               task.modulo_origem === 'auditoria' ? 'Auditoria' :
               task.modulo_origem === 'cobrancas' ? 'Cobranças' : 'Geral'}
            </span>
          </div>
          
          {task.data_vencimento && (
            <div className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              📅 {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
              {isOverdue && ' ⚠️'}
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
      className="my-0.5 h-0.5 w-full bg-primary opacity-0"
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
    onTaskDelete(taskId);
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-destructive bg-destructive/20 text-destructive"
          : "border-muted-foreground bg-muted/20 text-muted-foreground"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
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
      className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-muted/50"
    >
      <span>Adicionar tarefa</span>
      <FiPlus />
    </motion.button>
  );
};