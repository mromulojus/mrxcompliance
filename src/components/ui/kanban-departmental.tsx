"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from '@/integrations/supabase/client';
import { TarefaWithUser, TaskStatus } from "@/types/tarefas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FiPlus, FiX } from "react-icons/fi";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { TASK_PRIORITY_LABELS, TASK_MODULE_LABELS } from "@/types/tarefas";
import { Progress } from "@/components/ui/progress";

interface DepartmentalKanbanProps {
  tasks: TarefaWithUser[];
  selectedModulo?: string;
  selectedEmpresa?: string;
  onTaskUpdate: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskCreate: (moduleType: string) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onTaskClose?: (task: TarefaWithUser) => void;
  loading?: boolean;
}

interface BoardColumn {
  id: string;
  name: string;
  position: number;
  board_id: string;
}

interface DepartmentalBoard {
  id: string;
  name: string;
  empresa_id: string;
}

export const DepartmentalKanban = ({
  tasks,
  selectedModulo,
  selectedEmpresa,
  onTaskUpdate,
  onTaskCreate,
  onTaskClick,
  onTaskClose,
  loading = false
}: DepartmentalKanbanProps) => {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [board, setBoard] = useState<DepartmentalBoard | null>(null);
  const { toast } = useToast();

  // Module to board mapping
  const getModuleToBoardMapping = () => ({
    'geral': 'ADMINISTRATIVO',
    'ouvidoria': 'OUVIDORIA (Ouve.ai)',
    'auditoria': 'COMPLIANCE (Mrx Compliance)',
    'compliance': 'COMPLIANCE (Mrx Compliance)',
    'cobrancas': 'COBRANÇA (Debto)',
    'vendas': 'VENDAS (xGROWTH)',
    'juridico': 'JURIDICO (MR Advocacia)'
  });

  // Fetch board and columns for the selected module and company
  useEffect(() => {
    const fetchBoardAndColumns = async () => {
      if (!selectedModulo || !selectedEmpresa) {
        // Fallback to default columns if no module/empresa selected
        setColumns([
          { id: 'a_fazer', name: 'A Fazer', position: 0, board_id: 'default' },
          { id: 'em_andamento', name: 'Em Andamento', position: 1, board_id: 'default' },
          { id: 'em_revisao', name: 'Em Revisão', position: 2, board_id: 'default' },
          { id: 'concluido', name: 'Concluído', position: 3, board_id: 'default' }
        ] as BoardColumn[]);
        return;
      }

      try {
        const moduleMapping = getModuleToBoardMapping();
        const targetBoardName = moduleMapping[selectedModulo as keyof typeof moduleMapping];
        
        if (!targetBoardName) return;

        // First ensure the departmental boards exist
        await supabase.rpc('create_departmental_boards_for_empresa', {
          p_empresa_id: selectedEmpresa
        });

        // Find the board
        const { data: boardData, error: boardError } = await supabase
          .from('boards')
          .select('*')
          .eq('empresa_id', selectedEmpresa)
          .eq('name', targetBoardName)
          .eq('is_active', true)
          .single();

        if (boardError || !boardData) {
          console.warn('Board not found:', boardError);
          return;
        }

        setBoard(boardData);

        // Get columns for this board
        const { data: columnsData, error: columnsError } = await supabase
          .from('board_columns')
          .select('*')
          .eq('board_id', boardData.id)
          .order('position', { ascending: true });

        if (columnsError) {
          console.error('Error fetching columns:', columnsError);
          return;
        }

        setColumns(columnsData || []);
      } catch (error) {
        console.error('Error fetching board and columns:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o quadro departamental',
          variant: 'destructive'
        });
      }
    };

    fetchBoardAndColumns();
  }, [selectedModulo, selectedEmpresa, toast]);

  // Filter tasks that belong to this board
  const boardTasks = useMemo(() => {
    if (!board) return tasks;
    return tasks.filter(task => task.board_id === board.id);
  }, [tasks, board]);

  if (loading) {
    return (
      <div className="flex h-full w-full gap-3 p-4 overflow-x-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-6 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-full w-full min-h-[500px] border-2 border-dashed border-transparent">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-muted animate-pulse rounded-lg p-4 mb-3 h-32" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p>Selecione um módulo para ver o quadro departamental</p>
          <p className="text-sm mt-2">Os quadros são criados automaticamente por módulo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full gap-3 p-4 overflow-x-hidden">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          board={board}
          tasks={boardTasks}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={onTaskCreate}
          onTaskClick={onTaskClick}
          onTaskClose={onTaskClose}
          selectedModulo={selectedModulo || 'geral'}
        />
      ))}
    </div>
  );
};

interface ColumnProps {
  column: BoardColumn;
  board: DepartmentalBoard | null;
  tasks: TarefaWithUser[];
  onTaskUpdate: (taskId: string, newColumnId: string, newOrder: number) => void;
  onTaskCreate: (moduleType: string) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onTaskClose?: (task: TarefaWithUser) => void;
  selectedModulo: string;
}

const Column = ({
  column,
  board,
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskClick,
  onTaskClose,
  selectedModulo
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: React.DragEvent, task: TarefaWithUser) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("currentColumnId", task.column_id || "");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const taskId = e.dataTransfer.getData("taskId");
    const currentColumnId = e.dataTransfer.getData("currentColumnId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element.dataset.before || "-1";

    if (before !== taskId && currentColumnId !== column.id) {
      const filteredTasks = tasks.filter((t) => t.column_id === column.id);
      const moveToBack = before === "-1";
      
      let newOrder = 0;
      if (moveToBack) {
        newOrder = filteredTasks.length;
      } else {
        const insertAtIndex = filteredTasks.findIndex((t) => t.id === before);
        newOrder = insertAtIndex >= 0 ? insertAtIndex : 0;
      }

      onTaskUpdate(taskId, column.id, newOrder);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
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
        `[data-column="${column.id}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const columnTasks = tasks.filter((t) => t.column_id === column.id);

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-foreground">{column.name}</h3>
        <Badge variant="secondary" className="text-xs">
          {columnTasks.length}
        </Badge>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex-1 min-h-0 w-full overflow-y-auto transition-colors rounded-lg ${
          active ? "bg-neutral-300/60" : "bg-neutral-200"
        } min-h-[360px] border-2 border-dashed ${
          active ? "border-primary" : "border-neutral-300"
        }`}
      >
        <AddCard 
          onTaskCreate={() => onTaskCreate(selectedModulo)} 
        />
        {columnTasks
          .sort((a, b) => (a.ordem_na_coluna || 0) - (b.ordem_na_coluna || 0))
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              handleDragStart={handleDragStart}
              onTaskClick={onTaskClick}
              onCloseTask={onTaskClose ? () => onTaskClose(task) : undefined}
            />
          ))}
        <DropIndicator beforeId={null} column={column.id} />
      </div>
    </div>
  );
};

// Add card component
const AddCard = ({ onTaskCreate }: { onTaskCreate: () => void }) => {
  return (
    <div className="w-full p-3">
      <button
        onClick={onTaskCreate}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition hover:text-neutral-300"
      >
        <span>Adicionar cartão</span>
        <FiPlus />
      </button>
    </div>
  );
};

// Drop indicator component
const DropIndicator = ({ beforeId, column }: { beforeId: string | null; column: string }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-primary opacity-0"
    />
  );
};

// Task card component
const TaskCard = ({ 
  task, 
  handleDragStart, 
  onTaskClick, 
  onCloseTask 
}: { 
  task: TarefaWithUser; 
  handleDragStart: (e: React.DragEvent, task: TarefaWithUser) => void;
  onTaskClick?: (task: TarefaWithUser) => void;
  onCloseTask?: () => void;
}) => {
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
      case 'vendas': return 'bg-green-100 text-green-700 border-green-200';
      case 'juridico': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'compliance': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Parse checklist from description
  const parseDescricaoForChecklist = (descricao?: string) => {
    if (!descricao) return { baseDescription: '', parsedChecklist: [] };
    
    const checklistMatch = descricao.match(/checklist:(.*?)(?:comments:|$)/s);
    if (!checklistMatch) return { baseDescription: descricao, parsedChecklist: [] };
    
    try {
      const checklistJson = checklistMatch[1].trim();
      const parsedChecklist = JSON.parse(checklistJson);
      const baseDescription = descricao.replace(/checklist:.*$/s, '').trim();
      return { baseDescription, parsedChecklist };
    } catch {
      return { baseDescription: descricao, parsedChecklist: [] };
    }
  };

  const { baseDescription, parsedChecklist } = parseDescricaoForChecklist(task.descricao);
  const completedItems = parsedChecklist.filter((item: any) => item.completed).length;
  const progress = parsedChecklist.length > 0 ? (completedItems / parsedChecklist.length) * 100 : 0;

  return (
    <>
      <DropIndicator beforeId={task.id} column={task.column_id || ''} />
      <motion.div
        layout
        layoutId={task.id}
        draggable="true"
        onDragStart={(e: any) => handleDragStart(e, task)}
        onClick={() => onTaskClick?.(task)}
        className="cursor-grab rounded-lg border border-neutral-300 bg-white text-neutral-800 shadow-sm p-4 mb-3 active:cursor-grabbing hover:shadow-md transition-all hover:border-primary/50 group"
      >
        <div className="space-y-3">
          {/* Header with title and close button */}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium text-sm flex-1 line-clamp-2 group-hover:text-primary transition-colors">
              {task.titulo}
            </h4>
            <div className="flex items-start gap-2">
              {task.responsavel && (
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
              )}
              
              {onCloseTask && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      title="Fechar cartão"
                      onClick={(e) => { e.stopPropagation(); }}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-neutral-300 text-neutral-500 hover:text-destructive hover:border-destructive/60 hover:bg-destructive/10 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Fechar cartão?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação arquivará a tarefa. Você poderá encontrá-la em registros/relatórios.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={(e) => { e.stopPropagation(); onCloseTask(); }}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          {/* Description */}
          {baseDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {baseDescription}
            </p>
          )}
          
          {/* Checklist progress */}
          {parsedChecklist.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Checklist</span>
                <span className="text-[10px] text-muted-foreground">{completedItems}/{parsedChecklist.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
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
            
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Atrasada
              </Badge>
            )}
            
            {task.data_vencimento && !isOverdue && (
              <Badge variant="outline" className="text-xs">
                {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};