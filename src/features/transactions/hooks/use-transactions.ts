import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listTransactions } from '@/lib/api/transactions.api';
import type { ListTransactionsParams } from '../types';

export function useTransactions(filters: Omit<ListTransactionsParams, 'page' | 'limit'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      listTransactions({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
