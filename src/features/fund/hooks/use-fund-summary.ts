import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getFundSummary } from '@/lib/api/fund.api';

export function useFundSummary() {
  return useQuery({
    queryKey: queryKeys.fund.summary(),
    queryFn: getFundSummary,
  });
}
