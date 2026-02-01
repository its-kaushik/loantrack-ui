'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth.api';
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

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      login(phone, password),
    onSuccess: (data) => {
      setAuth(data);
      router.push(getRoleHomePath(data.user.role));
    },
  });
}
