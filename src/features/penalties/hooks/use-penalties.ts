import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getLoanPenalties } from '@/lib/api/penalties.api';

export function usePenalties(loanId: string) {
  return useQuery({
    queryKey: queryKeys.loans.penalties(loanId),
    queryFn: () => getLoanPenalties(loanId),
    enabled: !!loanId,
  });
}
