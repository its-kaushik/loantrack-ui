import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deactivateUser } from '@/lib/api/users.api';
import { queryKeys } from '@/lib/query-keys';

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      toast.success('User deactivated');
    },
  });
}
