import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { approveTransaction } from '@/lib/api/transactions.api';
import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse } from '@/types/api';
import type { TransactionDetail } from '@/types/entities';

export function useApproveTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveTransaction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.pending() });

      const previousData = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<TransactionDetail>>
      >(queryKeys.transactions.pending());

      // Optimistic: remove from pending list
      queryClient.setQueryData<InfiniteData<PaginatedResponse<TransactionDetail>>>(
        queryKeys.transactions.pending(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((txn) => txn.id !== id),
              pagination: {
                ...page.pagination,
                total: page.pagination.total - 1,
              },
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.transactions.pending(), context.previousData);
      }
      toast.error('Failed to approve transaction');
    },
    onSuccess: () => {
      toast.success('Transaction approved');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.today() });
    },
  });
}
