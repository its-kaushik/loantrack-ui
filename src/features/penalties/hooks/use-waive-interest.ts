import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { waiveInterest } from '@/lib/api/penalties.api';
import { queryKeys } from '@/lib/query-keys';

export function useWaiveInterest(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { waiveAmount: number; notes?: string }) =>
      waiveInterest(loanId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.paymentStatus(loanId) });
      toast.success('Interest waived successfully');
    },
  });
}
