import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fixEntry, getEntry, removeEntry } from '@/lib/api/transactions.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateTransactionRequest } from '@/types/requests';

/** The recorded payment a transaction row belongs to, and whether it may be changed. */
export function useEntry(transactionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transactions.entry(transactionId ?? ''),
    queryFn: () => getEntry(transactionId!),
    enabled: !!transactionId,
    // Whether an entry may be changed depends on what else has been recorded since
    staleTime: 0,
  });
}

/** A correction can touch two loans and every money figure, so everything derived from payments is refetched. */
function invalidateAfterCorrection(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.collector.missedToday() });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['fund'] });
  queryClient.invalidateQueries({ queryKey: ['reports'] });
}

export function useFixEntry(transactionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replacement: Omit<CreateTransactionRequest, 'correctedTransactionId'>) =>
      fixEntry(transactionId, replacement),
    onSuccess: () => {
      invalidateAfterCorrection(queryClient);
      toast.success('Entry corrected');
    },
  });
}

export function useRemoveEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason?: string }) =>
      removeEntry(transactionId, { reason }),
    onSuccess: () => {
      invalidateAfterCorrection(queryClient);
      toast.success('Entry removed');
    },
  });
}
