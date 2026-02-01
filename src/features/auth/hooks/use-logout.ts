'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth-store';

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuth();
      router.replace('/login');
    },
  });
}
