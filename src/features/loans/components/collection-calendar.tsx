'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLoanPaymentStatus } from '../hooks/use-loan-payment-status';
import type { DailyPaymentStatus } from '../types';

interface CollectionCalendarProps {
  loanId: string;
}

const statusColors = {
  paid: 'bg-green-500 text-white',
  missed: 'bg-red-500 text-white',
};

export function CollectionCalendar({ loanId }: CollectionCalendarProps) {
  const { data, isLoading } = useLoanPaymentStatus(loanId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  if (!data || !('days' in data)) {
    return null;
  }

  const status = data as DailyPaymentStatus;
  const daysElapsed = status.days.length;

  if (daysElapsed === 0) {
    return <p className="text-sm text-muted-foreground py-2">No collection days yet.</p>;
  }

  const daysPaid = Math.floor(status.totalCollected / status.dailyPaymentAmount);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: daysElapsed }, (_, i) => {
        const dayNumber = i + 1;
        const isPaid = dayNumber <= daysPaid;
        return (
          <div
            key={dayNumber}
            className={cn(
              'flex items-center justify-center rounded-md text-xs font-medium h-9 w-full',
              isPaid ? statusColors.paid : statusColors.missed,
            )}
          >
            {dayNumber}
          </div>
        );
      })}
    </div>
  );
}
