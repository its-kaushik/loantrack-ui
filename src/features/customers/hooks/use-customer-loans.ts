import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getCustomerLoans } from '@/lib/api/customers.api';

export function useCustomerLoans(customerId: string) {
  return useQuery({
    queryKey: queryKeys.customers.loans(customerId),
    queryFn: () => getCustomerLoans(customerId),
    enabled: !!customerId,
  });
}
