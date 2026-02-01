'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTodaySummary } from '@/features/dashboard/hooks/use-today-summary';
import {
  BottomTabBar,
  type TabItem,
} from '@/components/shared/bottom-tab-bar';
import { LayoutDashboard, Briefcase, Users, Wallet, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { data: todaySummary } = useTodaySummary();

  const adminTabs: TabItem[] = useMemo(
    () => [
      {
        label: 'Home',
        path: '/dashboard',
        icon: LayoutDashboard,
        badge: todaySummary?.pendingApprovalsCount,
      },
      { label: 'Loans', path: '/loans', icon: Briefcase },
      { label: 'Customers', path: '/customers', icon: Users },
      { label: 'Money', path: '/money', icon: Wallet },
      { label: 'More', path: '/more', icon: Menu },
    ],
    [todaySummary?.pendingApprovalsCount],
  );

  if (user?.role !== 'ADMIN') {
    if (typeof window !== 'undefined') {
      router.replace(user?.role === 'COLLECTOR' ? '/today' : '/platform');
    }
    return null;
  }

  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomTabBar tabs={adminTabs} />
    </div>
  );
}
