import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listExpenses } from '@/lib/api/expenses.api';
import type { ListExpensesFilters } from '../types';

export function useExpenses(filters: ListExpensesFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.expenses.list(filters as Record<string, unknown>),
    queryFn: ({ pageParam }) => listExpenses({ ...filters, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
