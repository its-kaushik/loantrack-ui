import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listFundEntries } from '@/lib/api/fund.api';
import type { ListFundEntriesFilters } from '../types';

export function useFundEntries(filters: ListFundEntriesFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.fund.entries(filters as Record<string, unknown>),
    queryFn: ({ pageParam }) => listFundEntries({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
