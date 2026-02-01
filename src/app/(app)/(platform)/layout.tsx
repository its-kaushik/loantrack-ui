'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { SidebarNav, type SidebarItem } from '@/components/shared/sidebar-nav';
import { BarChart3, Building, UserCircle, LogOut } from 'lucide-react';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  if (user?.role !== 'SUPER_ADMIN') {
    if (typeof window !== 'undefined') {
      router.replace(user?.role === 'ADMIN' ? '/dashboard' : '/today');
    }
    return null;
  }

  const sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', path: '/platform', icon: BarChart3 },
    { label: 'Tenants', path: '/platform/tenants', icon: Building },
    { label: 'Profile', path: '/shared/profile', icon: UserCircle },
    {
      label: 'Logout',
      path: '#',
      icon: LogOut,
      onClick: () => {
        clearAuth();
        router.replace('/login');
      },
    },
  ];

  return (
    <div className="flex min-h-screen">
      <SidebarNav items={sidebarItems} />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
