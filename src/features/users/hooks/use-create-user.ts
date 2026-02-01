import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUser } from '@/lib/api/users.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateUserRequest } from '@/types/requests';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateUserRequest) => createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      toast.success('User created successfully');
    },
  });
}
