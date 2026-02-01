import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getLoanPaymentStatus } from '@/lib/api/loans.api';

export function useLoanPaymentStatus(loanId: string) {
  return useQuery({
    queryKey: queryKeys.loans.paymentStatus(loanId),
    queryFn: () => getLoanPaymentStatus(loanId),
    enabled: !!loanId,
  });
}
