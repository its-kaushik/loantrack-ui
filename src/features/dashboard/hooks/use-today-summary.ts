import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getTodaySummary } from '@/lib/api/dashboard.api';

export function useTodaySummary(enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.today(),
    queryFn: getTodaySummary,
    enabled,
  });
}
