import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listUsers } from '@/lib/api/users.api';

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: listUsers,
  });
}
