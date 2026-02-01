'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { Fab } from '@/components/shared/fab';
import { LoanCard } from '@/features/loans/components/loan-card';
import { LoanListFilters } from '@/features/loans/components/loan-list-filters';
import { useLoans } from '@/features/loans/hooks/use-loans';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus } from 'lucide-react';
import type { LoanType, LoanStatus } from '@/types/enums';
import type { Loan } from '@/types/entities';

export default function LoansPage() {
  const [type, setType] = useState<LoanType | undefined>();
  const [status, setStatus] = useState<LoanStatus | undefined>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useLoans({
    type,
    status,
    search: debouncedSearch || undefined,
  });

  return (
    <div>
      <PageHeader title="Loans" />
      <div className="p-4 space-y-4">
        <LoanListFilters
          type={type}
          onTypeChange={setType}
          status={status}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
        />
        <InfiniteList<Loan>
          query={query}
          renderItem={(loan) => <LoanCard loan={loan} />}
          itemKey={(loan) => loan.id}
          emptyState={
            <EmptyState
              title="No loans yet"
              description="Create your first loan to get started."
              actionLabel="New Loan"
              actionHref="/loans/new"
            />
          }
        />
      </div>
      <Fab icon={Plus} label="New Loan" href="/loans/new" />
    </div>
  );
}
