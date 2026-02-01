'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { TransactionListFilters } from '@/features/transactions/components/transaction-list-filters';
import { TransactionRow } from '@/features/transactions/components/transaction-row';
import { ReversalSheet } from '@/features/transactions/components/reversal-sheet';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import type { ApprovalStatus, TransactionType } from '@/types/enums';
import type { TransactionDetail } from '@/types/entities';

export default function TransactionHistoryPage() {
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | undefined>();
  const [transactionType, setTransactionType] = useState<TransactionType | undefined>();
  const [collectedBy, setCollectedBy] = useState<string | undefined>();

  const [reversalTarget, setReversalTarget] = useState<TransactionDetail | null>(null);
  const [reversalOpen, setReversalOpen] = useState(false);

  const query = useTransactions({
    approvalStatus,
    transactionType,
    collectedBy,
  });

  const handleReverse = (txn: TransactionDetail) => {
    setReversalTarget(txn);
    setReversalOpen(true);
  };

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
            <TransactionRow
              transaction={txn}
              onReverse={handleReverse}
            />
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

      <ReversalSheet
        open={reversalOpen}
        onOpenChange={setReversalOpen}
        transaction={reversalTarget}
      />
    </div>
  );
}
