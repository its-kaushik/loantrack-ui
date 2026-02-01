'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Today', href: '/dashboard' },
  { label: 'Overdue', href: '/dashboard/overdue' },
  { label: 'Defaulters', href: '/dashboard/defaulters' },
  { label: 'Fund Summary', href: '/dashboard/fund-summary' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background sticky top-0 z-10">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                pathname === tab.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
