'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABBaseProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

interface FABClickProps extends FABBaseProps {
  onClick: () => void;
  href?: never;
}

interface FABLinkProps extends FABBaseProps {
  href: string;
  onClick?: never;
}

type FABProps = FABClickProps | FABLinkProps;

export function Fab({ icon: Icon, label, className, ...props }: FABProps) {
  const classes = cn(
    'fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95',
    className,
  );

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={(props as FABClickProps).onClick} className={classes}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

// Keep backward-compat export
export { Fab as FAB };
