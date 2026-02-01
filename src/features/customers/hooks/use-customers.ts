import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listCustomers } from '@/lib/api/customers.api';
import type { ListCustomersParams } from '../types';

export function useCustomers(filters: Omit<ListCustomersParams, 'page' | 'limit'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      listCustomers({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
