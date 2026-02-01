'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  BottomTabBar,
  type TabItem,
} from '@/components/shared/bottom-tab-bar';
import { Calendar, Briefcase, Users, UserCircle } from 'lucide-react';

const collectorTabs: TabItem[] = [
  { label: 'Today', path: '/today', icon: Calendar },
  { label: 'Loans', path: '/loans', icon: Briefcase },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Profile', path: '/profile', icon: UserCircle },
];

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  if (user?.role !== 'COLLECTOR') {
    if (typeof window !== 'undefined') {
      router.replace(user?.role === 'ADMIN' ? '/dashboard' : '/platform');
    }
    return null;
  }

  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomTabBar tabs={collectorTabs} />
    </div>
  );
}
