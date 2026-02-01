import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteExpense } from '@/lib/api/expenses.api';
import { queryKeys } from '@/lib/query-keys';

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.fundSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.fund.summary() });
      toast.success('Expense deleted');
    },
  });
}
