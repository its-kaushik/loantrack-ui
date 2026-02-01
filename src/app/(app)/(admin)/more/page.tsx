'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { usePendingTransactions } from '@/features/transactions/hooks/use-pending-transactions';
import {
  ClipboardCheck,
  History,
  UserCog,
  UserCircle,
  KeyRound,
  LogOut,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const staticItems: MenuItem[] = [
  { label: 'Pending Approvals', href: '/more/approvals', icon: ClipboardCheck },
  { label: 'Transaction History', href: '/more/transactions', icon: History },
  { label: 'User Management', href: '/more/users', icon: UserCog },
  { label: 'Migrate Loan', href: '/loans/migrate', icon: ArrowRightLeft },
  { label: 'Profile', href: '/shared/profile', icon: UserCircle },
  { label: 'Change Password', href: '/shared/change-password', icon: KeyRound },
];

export default function MorePage() {
  const logout = useLogout();
  const { data: pendingData } = usePendingTransactions();

  const pendingCount = pendingData?.pages[0]?.pagination.total ?? 0;

  const menuItems = staticItems.map((item) => {
    if (item.href === '/more/approvals' && pendingCount > 0) {
      return { ...item, badge: pendingCount };
    }
    return item;
  });

  return (
    <div>
      <PageHeader title="More" />
      <div className="divide-y">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="destructive" className="text-[10px] h-5 min-w-5 justify-center px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">
            {logout.isPending ? 'Signing out...' : 'Sign Out'}
          </span>
        </button>
      </div>
    </div>
  );
}
