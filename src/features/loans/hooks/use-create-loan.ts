import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createLoan } from '@/lib/api/loans.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateLoanRequest } from '@/types/requests';

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: CreateLoanRequest) => createLoan(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      toast.success('Loan created successfully');
      router.push(`/loans/${data.id}`);
    },
  });
}
