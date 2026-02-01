'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

function getRoleHomePath(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/platform';
    case 'COLLECTOR':
      return '/today';
    default:
      return '/dashboard';
  }
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, refreshToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (user && refreshToken) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [isHydrated, user, refreshToken, router]);

  // While hydrating or if authenticated (about to redirect), show nothing
  if (!isHydrated) return null;
  if (user && refreshToken) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
