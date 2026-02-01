import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resetPassword } from '@/lib/api/users.api';

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      resetPassword(id, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
  });
}
