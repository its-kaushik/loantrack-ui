import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { migrateLoan } from '@/lib/api/loans.api';
import { queryKeys } from '@/lib/query-keys';
import type { MigrateLoanRequest } from '@/types/requests';

export function useMigrateLoan() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: MigrateLoanRequest) => migrateLoan(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      toast.success('Loan migrated successfully');
      router.push(`/loans/${data.id}`);
    },
  });
}
