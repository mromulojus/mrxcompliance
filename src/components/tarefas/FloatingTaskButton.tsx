import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TaskFormModalWithBoard from '@/components/tarefas/TaskFormModalWithBoard';
import { TaskFormData } from '@/types/tarefas';

interface FloatingTaskButtonProps {
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

export function FloatingTaskButton({ onTaskCreate, users, contextData }: FloatingTaskButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskSubmit = async (taskData: TaskFormData) => {
    await onTaskCreate(taskData);
    setIsModalOpen(false);
  };

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
              <Button
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Nova Tarefa</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TaskFormModalWithBoard
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleTaskSubmit}
        users={users}
        defaultValues={contextData}
      />
    </>
  );
}