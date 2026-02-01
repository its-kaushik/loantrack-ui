import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getLoan } from '@/lib/api/loans.api';

export function useLoanDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.loans.detail(id),
    queryFn: () => getLoan(id),
    enabled: !!id,
  });
}
