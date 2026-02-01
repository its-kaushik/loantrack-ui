import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTransaction } from '@/lib/api/transactions.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateTransactionRequest } from '@/types/requests';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTransactionRequest) => createTransaction(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.transactions(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.paymentStatus(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.today() });
      toast.success('Transaction recorded successfully');
    },
  });
}
