import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getCollectorSummary } from '@/lib/api/reports.api';

export function useCollectorSummary(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.reports.collectorSummary(from, to),
    queryFn: () => getCollectorSummary(from, to),
    enabled: !!from && !!to,
  });
}
