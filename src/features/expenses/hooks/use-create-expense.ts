import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createExpense } from '@/lib/api/expenses.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateExpenseRequest } from '@/types/requests';

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateExpenseRequest) => createExpense(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.fundSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.fund.summary() });
      toast.success('Expense added successfully');
    },
  });
}
