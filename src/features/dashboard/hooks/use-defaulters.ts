import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getDefaultersSummary } from '@/lib/api/dashboard.api';

export function useDefaulters() {
  return useQuery({
    queryKey: queryKeys.dashboard.defaulters(),
    queryFn: getDefaultersSummary,
  });
}
