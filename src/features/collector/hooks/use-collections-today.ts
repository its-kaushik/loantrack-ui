import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getMissedToday } from '@/lib/api/loans.api';
import type { MissedTodayResponse } from '@/lib/api/loans.api';

export function useCollectionsToday() {
  return useQuery({
    queryKey: queryKeys.collector.missedToday(),
    queryFn: (): Promise<MissedTodayResponse> => getMissedToday(),
  });
}
