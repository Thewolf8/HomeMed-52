import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { ExpirationStatus } from '@/types';
import { getStatusLabel } from '@/utils/helpers';

interface StatusBadgeProps {
  status: ExpirationStatus;
  className?: string;
}

const statusConfig: Record<ExpirationStatus, { text: string; bg: string; icon: React.ReactNode }> = {
  expired: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  expiring: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    icon: <Clock className="h-3 w-3" />,
  },
  good: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1 rounded-full px-2 text-xs font-medium',
        config.text,
        config.bg,
        className
      )}
    >
      {config.icon}
      {getStatusLabel(status)}
    </span>
  );
}

interface QuantityBadgeProps {
  quantity: number;
  className?: string;
}

export function QuantityBadge({ quantity, className }: QuantityBadgeProps) {
  const isLow = quantity <= 5;

  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center rounded-full px-2 text-xs font-medium',
        isLow ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-700/30',
        className
      )}
    >
      Qty: {quantity}
    </span>
  );
}
