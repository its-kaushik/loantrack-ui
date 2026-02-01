import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { waivePenalty } from '@/lib/api/penalties.api';
import { queryKeys } from '@/lib/query-keys';

export function useWaivePenalty(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ penaltyId, waiveAmount, notes }: { penaltyId: string; waiveAmount: number; notes?: string }) =>
      waivePenalty(penaltyId, { waiveAmount, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.penalties(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      toast.success('Penalty waived successfully');
    },
  });
}
