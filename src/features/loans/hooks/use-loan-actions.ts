import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { closeLoan, defaultLoan, writeOffLoan, cancelLoan, settleLoan } from '@/lib/api/loans.api';
import { queryKeys } from '@/lib/query-keys';

export function useCloseLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      toast.success('Loan closed successfully');
    },
  });
}

export function useDefaultLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => defaultLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      toast.success('Loan marked as defaulted');
    },
  });
}

export function useWriteOffLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => writeOffLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      toast.success('Loan written off');
    },
  });
}

export function useCancelLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => cancelLoan(loanId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      toast.success('Loan cancelled');
    },
  });
}

export function useSettleLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { settlementAmount: number; note?: string }) => settleLoan(loanId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(loanId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all() });
      // A settled loan leaves the collection lists and changes the money figures
      queryClient.invalidateQueries({ queryKey: queryKeys.collector.missedToday() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.today() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overdue() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.fundSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.fund.summary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.loanBook() });
      toast.success('Loan settled and closed');
    },
  });
}
