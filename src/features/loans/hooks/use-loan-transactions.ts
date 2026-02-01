import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getLoanTransactions } from '@/lib/api/loans.api';

export function useLoanTransactions(loanId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.loans.transactions(loanId),
    queryFn: ({ pageParam }) => getLoanTransactions(loanId, { page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!loanId,
  });
}
