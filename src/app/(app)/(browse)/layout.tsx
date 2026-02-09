'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTodaySummary } from '@/features/dashboard/hooks/use-today-summary';
import {
  BottomTabBar,
  type TabItem,
} from '@/components/shared/bottom-tab-bar';
import { LayoutDashboard, Briefcase, Users, Wallet, Menu, Calendar, UserCircle } from 'lucide-react';

const collectorTabs: TabItem[] = [
  { label: 'Today', path: '/today', icon: Calendar },
  { label: 'Loans', path: '/loans', icon: Briefcase },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Profile', path: '/profile', icon: UserCircle },
];

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isCollector = user?.role === 'COLLECTOR';
  const { data: todaySummary } = useTodaySummary(!isCollector);

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

  if (user?.role === 'SUPER_ADMIN') {
    if (typeof window !== 'undefined') {
      router.replace('/platform');
    }
    return null;
  }

  const tabs = isCollector ? collectorTabs : adminTabs;
  const isReadOnly = isCollector;

  return (
    <div className="min-h-screen pb-16" data-read-only={isReadOnly || undefined}>
      {children}
      <BottomTabBar tabs={tabs} />
    </div>
  );
}
