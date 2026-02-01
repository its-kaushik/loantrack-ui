'use client';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { InfiniteList } from '@/components/shared/infinite-list';
import { PendingTransactionCard } from '@/features/transactions/components/pending-transaction-card';
import { usePendingTransactions } from '@/features/transactions/hooks/use-pending-transactions';
import type { TransactionDetail } from '@/types/entities';

export default function PendingApprovalsPage() {
  const query = usePendingTransactions();

  return (
    <div>
      <PageHeader title="Pending Approvals" backHref="/more" />
      <div className="p-4 space-y-3">
        <InfiniteList<TransactionDetail>
          query={query}
          renderItem={(txn) => <PendingTransactionCard transaction={txn} />}
          itemKey={(txn) => txn.id}
          emptyState={
            <EmptyState
              title="All caught up!"
              description="No pending approvals at the moment."
            />
          }
        />
      </div>
    </div>
  );
}
