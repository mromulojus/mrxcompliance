import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TaskFormModalWithBoard from '@/components/tarefas/TaskFormModalWithBoard';
import { EventFormModal } from '@/components/eventos/EventFormModal';
import { TaskFormData } from '@/types/tarefas';
import { useHR } from '@/context/HRContext';

interface FloatingActionButtonProps {
  onTaskCreate: (task: TaskFormData) => Promise<void>;
  users: any[];
  contextData?: {
    empresa_id?: string;
    modulo_origem?: 'ouvidoria' | 'auditoria' | 'cobrancas' | 'geral';
    denuncia_id?: string;
    divida_id?: string;
    processo_id?: string;
    colaborador_id?: string;
  };
}

export function FloatingActionButton({ onTaskCreate, users, contextData }: FloatingActionButtonProps) {
  const { empresas, empresaSelecionada } = useHR();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleTaskSubmit = async (taskData: TaskFormData) => {
    await onTaskCreate(taskData);
    setIsTaskModalOpen(false);
  };

  const handleEventSubmit = () => {
    setIsEventModalOpen(false);
  };

  // Obter empresa_id para eventos
  const empresaId = contextData?.empresa_id || empresaSelecionada || (empresas.length > 0 ? empresas[0].id : null);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="fixed bottom-6 right-6 z-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ListTodo className="h-4 w-4" />
                    Nova Tarefa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsEventModalOpen(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="h-4 w-4" />
                    Novo Evento
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Criar Nova Tarefa ou Evento</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TaskFormModalWithBoard
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        onSubmit={handleTaskSubmit}
        users={users}
        defaultValues={contextData}
      />

      {empresaId && (
        <EventFormModal
          open={isEventModalOpen}
          onOpenChange={setIsEventModalOpen}
          onSubmit={handleEventSubmit}
          empresaId={empresaId}
        />
      )}
    </>
  );
}