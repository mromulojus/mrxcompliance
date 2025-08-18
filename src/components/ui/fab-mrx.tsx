import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/components/ui/logo';

type Props = {
  onClick: () => void;
};

export const FabMrx: React.FC<Props> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Nova Tarefa"
          >
            <Logo variant="icon" size="sm" className="h-6 w-6" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>Nova Tarefa</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

