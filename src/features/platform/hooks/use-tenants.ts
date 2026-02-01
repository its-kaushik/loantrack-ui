import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listTenants } from '@/lib/api/platform.api';
import type { ListTenantsFilters } from '../types';

export function useTenants(filters: ListTenantsFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.platform.tenants.list(filters as Record<string, unknown>),
    queryFn: ({ pageParam }) =>
      listTenants({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
