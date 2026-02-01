import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getOverdueSummary } from '@/lib/api/dashboard.api';

export function useOverdue() {
  return useQuery({
    queryKey: queryKeys.dashboard.overdue(),
    queryFn: getOverdueSummary,
  });
}
