import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateCustomer } from '@/lib/api/customers.api';
import { queryKeys } from '@/lib/query-keys';
import type { UpdateCustomerRequest } from '@/types/requests';

export function useUpdateCustomer(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCustomerRequest) => updateCustomer(customerId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      toast.success('Customer updated successfully');
    },
  });
}
