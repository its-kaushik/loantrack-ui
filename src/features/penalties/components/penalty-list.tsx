'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { WaivePenaltySheet } from './waive-penalty-sheet';
import { usePenalties } from '../hooks/use-penalties';
import { formatDate } from '@/utils/date';
import type { Penalty } from '@/types/entities';

interface PenaltyListProps {
  loanId: string;
}

export function PenaltyList({ loanId }: PenaltyListProps) {
  const { data, isLoading } = usePenalties(loanId);
  const [waiveTarget, setWaiveTarget] = useState<Penalty | null>(null);
  const [waiveOpen, setWaiveOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-lg" />;
  }

  const penalties = data?.data ?? [];

  if (penalties.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No penalties.</p>;
  }

  const handleWaive = (penalty: Penalty) => {
    setWaiveTarget(penalty);
    setWaiveOpen(true);
  };

  return (
    <>
      <div className="space-y-1">
        {penalties.map((penalty) => {
          const canWaive = penalty.status === 'PENDING' || penalty.status === 'PARTIALLY_PAID';
          return (
            <div
              key={penalty.id}
              className="flex items-center justify-between py-2.5 px-1 border-b last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <StatusBadge status={penalty.status} variant="penalty" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(penalty.imposedDate)}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{penalty.monthsCharged} mo × {penalty.daysOverdue}d overdue</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    <CurrencyDisplay amount={penalty.netPayable} />
                  </p>
                  {penalty.amountCollected > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Paid: <CurrencyDisplay amount={penalty.amountCollected} />
                    </p>
                  )}
                  {penalty.waivedAmount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Waived: <CurrencyDisplay amount={penalty.waivedAmount} />
                    </p>
                  )}
                </div>
                {canWaive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleWaive(penalty)}
                  >
                    Waive
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <WaivePenaltySheet
        open={waiveOpen}
        onOpenChange={setWaiveOpen}
        penalty={waiveTarget}
        loanId={loanId}
      />
    </>
  );
}
