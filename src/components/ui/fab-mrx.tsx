import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export const FabMrx: React.FC<Props> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      aria-label="Nova Tarefa"
      title="Nova Tarefa"
    >
      <Plus className="h-5 w-5" />
    </motion.button>
  );
};

