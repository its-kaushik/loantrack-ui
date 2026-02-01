import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listPendingTransactions } from '@/lib/api/transactions.api';

export function usePendingTransactions() {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.pending(),
    queryFn: ({ pageParam = 1 }) =>
      listPendingTransactions({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
