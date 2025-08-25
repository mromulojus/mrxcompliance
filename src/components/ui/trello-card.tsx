import React from "react";
import { motion } from "framer-motion";
import { X, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TarefaWithUser } from "@/types/tarefas";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrelloCardProps {
  task: TarefaWithUser;
  onDragStart: (e: React.DragEvent, task: TarefaWithUser) => void;
  onClick?: (task: TarefaWithUser) => void;
  onClose?: (task: TarefaWithUser) => void;
}

const getPriorityBadgeColor = (priority: string) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-500 hover:bg-red-600';
    case 'media':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'baixa':
      return 'bg-green-500 hover:bg-green-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const getModuleBadgeColor = (module: string) => {
  switch (module) {
    case 'ouvidoria':
      return 'bg-purple-500 hover:bg-purple-600';
    case 'auditoria':
    case 'compliance':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'cobrancas':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'vendas':
      return 'bg-emerald-500 hover:bg-emerald-600';
    case 'juridico':
      return 'bg-indigo-500 hover:bg-indigo-600';
    default:
      return 'bg-slate-500 hover:bg-slate-600';
  }
};

export const TrelloCard: React.FC<TrelloCardProps> = ({
  task,
  onDragStart,
  onClick,
  onClose,
}) => {
  const isOverdue = task.data_vencimento && new Date(task.data_vencimento) < new Date();

  return (
    <motion.div
      layout
      layoutId={task.id}
      draggable="true"
      onDragStart={(e: any) => onDragStart(e, task)}
      onClick={() => onClick?.(task)}
      className={cn(
        "group cursor-pointer rounded-md bg-white p-3 mb-2 shadow-sm border hover:shadow-md transition-all",
        "hover:border-primary/20 active:cursor-grabbing",
        isOverdue && "border-l-4 border-l-red-500"
      )}
    >
      {/* Close button - only visible on hover */}
      {onClose && (
        <div className="flex justify-end mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arquivar tarefa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação arquivará a tarefa. Você poderá encontrá-la em registros/relatórios.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={(e) => {
                  e.stopPropagation();
                  onClose(task);
                }}>
                  Arquivar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {task.titulo}
      </h4>

      {/* Tags row */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        {/* Priority badge - small colored circle */}
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            getPriorityBadgeColor(task.prioridade)
          )}
          title={`Prioridade: ${task.prioridade}`}
        />
        
        {/* Module badge - small colored circle */}
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            getModuleBadgeColor(task.modulo_origem)
          )}
          title={`Módulo: ${task.modulo_origem}`}
        />

        {/* Due date badge */}
        {task.data_vencimento && (
          <Badge 
            variant={isOverdue ? "destructive" : "secondary"} 
            className="text-xs px-1 py-0 h-4"
          >
            <Calendar className="h-2 w-2 mr-1" />
            {new Date(task.data_vencimento).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            })}
          </Badge>
        )}
      </div>

      {/* Bottom row - Avatar */}
      <div className="flex items-center justify-between">
        <div className="flex-1" /> {/* Spacer */}
        
        {/* Responsible avatar */}
        {task.responsavel ? (
          <Avatar className="h-6 w-6 border border-gray-200">
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
          <div 
            className="h-6 w-6 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center"
            title="Sem responsável"
          >
            <User className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
};