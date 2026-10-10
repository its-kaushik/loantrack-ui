'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { TransactionListFilters } from '@/features/transactions/components/transaction-list-filters';
import { TransactionRow } from '@/features/transactions/components/transaction-row';
import { RemoveEntrySheet } from '@/features/transactions/components/remove-entry-sheet';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import type { ApprovalStatus, TransactionType } from '@/types/enums';
import type { TransactionDetail } from '@/types/entities';

export default function TransactionHistoryPage() {
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | undefined>();
  const [transactionType, setTransactionType] = useState<TransactionType | undefined>();
  const [collectedBy, setCollectedBy] = useState<string | undefined>();

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const query = useTransactions({
    approvalStatus,
    transactionType,
    collectedBy,
  });

  return (
    <div>
      <PageHeader title="Transaction History" backHref="/more" />
      <div className="p-4 space-y-4">
        <TransactionListFilters
          approvalStatus={approvalStatus}
          onApprovalStatusChange={setApprovalStatus}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
          collectedBy={collectedBy}
          onCollectedByChange={setCollectedBy}
        />
        <InfiniteList<TransactionDetail>
          query={query}
          renderItem={(txn) => (
            <TransactionRow transaction={txn} onRemove={setRemoveTarget} />
          )}
          itemKey={(txn) => txn.id}
          emptyState={
            <EmptyState
              title="No transactions"
              description="No transactions found matching your filters."
            />
          }
        />
      </div>

      <RemoveEntrySheet
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        transactionId={removeTarget}
      />
    </div>
  );
}
