import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createFundEntry } from '@/lib/api/fund.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateFundEntryRequest } from '@/types/requests';

export function useCreateFundEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateFundEntryRequest) => createFundEntry(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.fundSummary() });
      toast.success('Fund entry added successfully');
    },
  });
}
