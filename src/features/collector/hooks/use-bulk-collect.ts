import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkCollect } from '@/lib/api/transactions.api';
import { queryKeys } from '@/lib/query-keys';
import type { BulkCollectionResult } from '@/types/entities';

interface BulkCollectVariables {
  collections: Array<{
    loanId: string;
    amount: number;
    transactionDate: string;
    notes?: string;
  }>;
  idempotencyKey: string;
}

export function useBulkCollect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ collections, idempotencyKey }: BulkCollectVariables): Promise<BulkCollectionResult> =>
      bulkCollect({ collections }, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
      queryClient.invalidateQueries({ queryKey: ['collector', 'collections-today'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.today() });
    },
  });
}
