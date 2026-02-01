import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { imposePenalty } from '@/lib/api/penalties.api';
import { queryKeys } from '@/lib/query-keys';

export function useImposePenalty(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body?: { overrideAmount?: number; notes?: string }) =>
      imposePenalty(loanId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.penalties(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      toast.success('Penalty imposed successfully');
    },
  });
}
