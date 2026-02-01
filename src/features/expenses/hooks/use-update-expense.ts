import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateExpense } from '@/lib/api/expenses.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateExpenseRequest } from '@/types/requests';

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateExpenseRequest> }) =>
      updateExpense(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.fundSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.fund.summary() });
      toast.success('Expense updated successfully');
    },
  });
}
