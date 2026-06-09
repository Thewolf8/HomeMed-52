import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = <Pill className="h-16 w-16" />,
  title = 'Nothing here yet',
  description = 'Start by adding your first medicine.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <motion.div
        className="mb-4 text-slate-600"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>
      <h3 className="mb-2 text-base font-semibold text-slate-100">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-slate-400">{description}</p>
      {action}
    </div>
  );
}
