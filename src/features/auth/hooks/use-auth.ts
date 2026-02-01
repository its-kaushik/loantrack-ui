'use client';

import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  return {
    user,
    isHydrated,
    isAuthenticated: !!accessToken && !!user,
    isAdmin: user?.role === 'ADMIN',
    isCollector: user?.role === 'COLLECTOR',
    isSuperAdmin: user?.role === 'SUPER_ADMIN',
  };
}
