'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

export function FAB({ icon: Icon, label, onClick, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}
