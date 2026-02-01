import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getPlatformStats } from '@/lib/api/platform.api';

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platform.stats(),
    queryFn: getPlatformStats,
  });
}
