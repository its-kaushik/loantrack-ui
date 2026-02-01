import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getProfitLoss } from '@/lib/api/reports.api';

export function useProfitLoss(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.reports.profitLoss(from, to),
    queryFn: () => getProfitLoss(from, to),
    enabled: !!from && !!to,
  });
}
