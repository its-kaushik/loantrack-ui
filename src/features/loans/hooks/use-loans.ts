import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listLoans } from '@/lib/api/loans.api';
import type { ListLoansParams } from '../types';

export function useLoans(filters: Omit<ListLoansParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: queryKeys.loans.list(filters),
    queryFn: ({ pageParam }) => listLoans({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
