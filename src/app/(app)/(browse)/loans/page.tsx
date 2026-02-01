'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { Fab } from '@/components/shared/fab';
import { LoanCard } from '@/features/loans/components/loan-card';
import { LoanListFilters } from '@/features/loans/components/loan-list-filters';
import { useLoans } from '@/features/loans/hooks/use-loans';
import { useAuthStore } from '@/stores/auth-store';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus } from 'lucide-react';
import type { LoanType, LoanStatus } from '@/types/enums';
import type { Loan } from '@/types/entities';

export default function LoansPage() {
  const isCollector = useAuthStore((s) => s.user?.role === 'COLLECTOR');
  const [type, setType] = useState<LoanType | undefined>();
  const [status, setStatus] = useState<LoanStatus | undefined>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useLoans({
    type: isCollector ? 'DAILY' : type,
    status: isCollector ? 'ACTIVE' : status,
    search: debouncedSearch || undefined,
  });

  return (
    <div>
      <PageHeader title="Loans" />
      <div className="p-4 space-y-4">
        {!isCollector && (
          <LoanListFilters
            type={type}
            onTypeChange={setType}
            status={status}
            onStatusChange={setStatus}
            search={search}
            onSearchChange={setSearch}
          />
        )}
        {isCollector && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search loans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        )}
        <InfiniteList<Loan>
          query={query}
          renderItem={(loan) => <LoanCard loan={loan} />}
          itemKey={(loan) => loan.id}
          emptyState={
            <EmptyState
              title={isCollector ? 'No active loans' : 'No loans yet'}
              description={isCollector ? 'No active daily loans to display.' : 'Create your first loan to get started.'}
              actionLabel={isCollector ? undefined : 'New Loan'}
              actionHref={isCollector ? undefined : '/loans/new'}
            />
          }
        />
      </div>
      {!isCollector && <Fab icon={Plus} label="New Loan" href="/loans/new" />}
    </div>
  );
}
