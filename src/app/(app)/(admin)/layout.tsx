'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  BottomTabBar,
  type TabItem,
} from '@/components/shared/bottom-tab-bar';
import { LayoutDashboard, Briefcase, Users, Wallet, Menu } from 'lucide-react';

const adminTabs: TabItem[] = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Loans', path: '/loans', icon: Briefcase },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Money', path: '/money', icon: Wallet },
  { label: 'More', path: '/more', icon: Menu },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

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
