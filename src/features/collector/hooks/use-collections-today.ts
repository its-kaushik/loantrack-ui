import { useQuery } from '@tanstack/react-query';
import { getMissedToday } from '@/lib/api/loans.api';
import type { MissedTodayResponse } from '@/lib/api/loans.api';

export function useCollectionsToday() {
  return useQuery({
    queryKey: ['collector', 'missed-today'],
    queryFn: (): Promise<MissedTodayResponse> => getMissedToday(),
  });
}
