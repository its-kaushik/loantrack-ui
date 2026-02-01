import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getLoanBook } from '@/lib/api/reports.api';

export function useLoanBook() {
  return useQuery({
    queryKey: queryKeys.reports.loanBook(),
    queryFn: getLoanBook,
  });
}
