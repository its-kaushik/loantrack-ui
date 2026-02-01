import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getTenant } from '@/lib/api/platform.api';

export function useTenantDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.platform.tenants.detail(id),
    queryFn: () => getTenant(id),
    enabled: !!id,
  });
}
