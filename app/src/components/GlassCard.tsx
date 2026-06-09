import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
  borderColor?: string;
}

export function GlassCard({ children, className, hoverable = false, glowOnHover = false, onClick, borderColor }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5',
        'bg-gradient-to-br from-[rgba(21,29,46,0.7)] to-[rgba(15,23,42,0.5)]',
        'border-[rgba(94,234,212,0.12)] backdrop-blur-[10px]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
        hoverable && 'cursor-pointer transition-all duration-200',
        className
      )}
      style={borderColor ? { borderColor } : undefined}
      whileHover={hoverable ? { y: -2, borderColor: 'rgba(94,234,212,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' } : undefined}
      whileTap={hoverable ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {glowOnHover && hoverable && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      {children}
    </motion.div>
  );
}
