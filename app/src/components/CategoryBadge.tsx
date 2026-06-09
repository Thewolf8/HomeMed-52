import { cn } from '@/lib/utils';
import type { Medicine } from '@/types';
import { getCategoryLabel } from '@/utils/helpers';

interface CategoryBadgeProps {
  category: Medicine['category'];
  className?: string;
}

const categoryStyles: Record<string, { text: string; bg: string }> = {
  adult: { text: 'text-slate-100', bg: 'bg-slate-700/50' },
  children: { text: 'text-violet-400', bg: 'bg-violet-500/10' },
  emergency: { text: 'text-red-400', bg: 'bg-red-500/10' },
  chronic_illness: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  other: { text: 'text-slate-400', bg: 'bg-slate-700/30' },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const style = categoryStyles[category] || categoryStyles.other;

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold',
        style.text,
        style.bg,
        className
      )}
    >
      {getCategoryLabel(category)}
    </span>
  );
}
