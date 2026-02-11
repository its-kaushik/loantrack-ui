'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { RejectionReasonSheet } from './rejection-reason-sheet';
import { useApproveTransaction } from '../hooks/use-approve-transaction';
import { useRejectTransaction } from '../hooks/use-reject-transaction';
import { formatDate } from '@/utils/date';
import { Check, X } from 'lucide-react';
import type { TransactionDetail } from '@/types/entities';

const typeLabels: Record<string, string> = {
  INTEREST_PAYMENT: 'Interest',
  PRINCIPAL_RETURN: 'Principal Return',
  DAILY_COLLECTION: 'Collection',
  PENALTY: 'Penalty',
  GUARANTOR_PAYMENT: 'Guarantor',
};

interface PendingTransactionCardProps {
  transaction: TransactionDetail;
}

export function PendingTransactionCard({ transaction }: PendingTransactionCardProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const handleApprove = () => {
    approveMutation.mutate(transaction.id);
  };

  const handleReject = (reason: string) => {
    rejectMutation.mutate(
      { id: transaction.id, reason },
      { onSuccess: () => setRejectOpen(false) },
    );
  };

  return (
    <>
      <Card>
        <CardContent className="py-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-medium">{transaction.borrowerName}</p>
                <Badge variant="outline" className="text-[10px]">
                  {typeLabels[transaction.transactionType] ?? transaction.transactionType}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{transaction.loanNumber}</p>
              {transaction.collectorName && (
                <p className="text-xs text-muted-foreground">
                  By {transaction.collectorName}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(transaction.transactionDate)}
              </p>
            </div>
            <p className="text-sm font-semibold flex-shrink-0 ml-3">
              <CurrencyDisplay amount={transaction.amount} />
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              <Check className="mr-1 h-4 w-4" />
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-destructive border-destructive"
              onClick={() => setRejectOpen(true)}
            >
              <X className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      <RejectionReasonSheet
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onReject={handleReject}
        loading={rejectMutation.isPending}
      />
    </>
  );
}
