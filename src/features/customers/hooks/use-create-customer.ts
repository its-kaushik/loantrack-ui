import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createCustomer } from '@/lib/api/customers.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateCustomerRequest } from '@/types/requests';

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: CreateCustomerRequest) => createCustomer(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all() });
      toast.success('Customer created successfully');
      router.push(`/customers/${data.id}`);
    },
  });
}
