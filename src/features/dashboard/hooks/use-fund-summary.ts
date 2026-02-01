import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getFundSummary } from '@/lib/api/dashboard.api';

export function useFundSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.fundSummary(),
    queryFn: getFundSummary,
  });
}
