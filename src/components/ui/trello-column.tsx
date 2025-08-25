import React, { useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrelloCard } from "./trello-card";
import { TarefaWithUser } from "@/types/tarefas";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrelloColumnProps {
  id: string;
  title: string;
  tasks: TarefaWithUser[];
  onTaskUpdate: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskCreate: (columnId: string) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onTaskClose?: (task: TarefaWithUser) => void;
  onColumnUpdate?: (columnId: string, updates: { name?: string }) => void;
  onColumnDelete?: (columnId: string) => void;
}

export const TrelloColumn: React.FC<TrelloColumnProps> = ({
  id,
  title,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskClick,
  onTaskClose,
  onColumnUpdate,
  onColumnDelete,
}) => {
  const [active, setActive] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleDragStart = (e: React.DragEvent, task: TarefaWithUser) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("sourceColumnId", task.column_id || "");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";

    if (before !== taskId && sourceColumnId !== id) {
      const moveToBack = before === "-1";
      let newOrder = 0;
      
      if (moveToBack) {
        newOrder = tasks.length;
      } else {
        const insertAtIndex = tasks.findIndex((t) => t.id === before);
        newOrder = insertAtIndex >= 0 ? insertAtIndex : 0;
      }

      onTaskUpdate(taskId, id, newOrder);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: React.DragEvent) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: React.DragEvent, indicators: HTMLElement[]) => {
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
        `[data-column="${id}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== title && onColumnUpdate) {
      onColumnUpdate(id, { name: editTitle.trim() });
    }
    setIsEditingTitle(false);
    setEditTitle(title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditTitle(title);
    }
  };

  return (
    <div className="flex-shrink-0 w-80 h-fit max-h-full flex flex-col bg-gray-50 rounded-lg p-3">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        {isEditingTitle ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 text-sm font-semibold bg-transparent border-none outline-none focus:bg-white focus:border focus:border-primary focus:rounded px-1"
            autoFocus
          />
        ) : (
          <h3 
            className="text-sm font-semibold text-gray-700 flex-1 cursor-pointer hover:bg-gray-200 rounded px-1 py-0.5"
            onClick={() => onColumnUpdate && setIsEditingTitle(true)}
          >
            {title}
          </h3>
        )}
        
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
          
          {(onColumnUpdate || onColumnDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onColumnUpdate && (
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    Renomear coluna
                  </DropdownMenuItem>
                )}
                {onColumnDelete && (
                  <DropdownMenuItem 
                    onClick={() => onColumnDelete(id)}
                    className="text-destructive"
                  >
                    Excluir coluna
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Tasks container */}
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex-1 min-h-32 transition-all rounded",
          active ? "bg-primary/10 border-2 border-dashed border-primary" : ""
        )}
      >
        {/* Add card button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTaskCreate(id)}
          className="w-full justify-start mb-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar cartão
        </Button>

        {/* Tasks */}
        {tasks
          .sort((a, b) => (a.ordem_na_coluna || 0) - (b.ordem_na_coluna || 0))
          .map((task, index) => (
            <React.Fragment key={task.id}>
              <DropIndicator beforeId={task.id} column={id} />
              <TrelloCard
                task={task}
                onDragStart={handleDragStart}
                onClick={onTaskClick}
                onClose={onTaskClose}
              />
            </React.Fragment>
          ))}
        
        <DropIndicator beforeId={null} column={id} />
      </div>
    </div>
  );
};

// Drop indicator component
const DropIndicator = ({ beforeId, column }: { beforeId: string | null; column: string }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-primary opacity-0 rounded"
    />
  );
};