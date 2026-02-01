'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLoanPaymentStatus } from '../hooks/use-loan-payment-status';
import type { DailyPaymentStatus, DailyPaymentDay } from '../types';

interface CollectionCalendarProps {
  loanId: string;
}

function getDayStatus(day: DailyPaymentDay): 'paid' | 'missed' | 'future' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date + 'T00:00:00');

  if (day.isCovered) return 'paid';
  if (dayDate < today) return 'missed';
  return 'future';
}

const statusColors = {
  paid: 'bg-green-500 text-white',
  missed: 'bg-red-500 text-white',
  future: 'bg-muted text-muted-foreground',
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

  if (status.days.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No collection days yet.</p>;
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {status.days.map((day) => {
        const dayStatus = getDayStatus(day);
        return (
          <div
            key={day.dayNumber}
            className={cn(
              'flex items-center justify-center rounded-md text-xs font-medium h-9 w-full',
              statusColors[dayStatus],
            )}
            title={`Day ${day.dayNumber} — ${day.date}`}
          >
            {day.dayNumber}
          </div>
        );
      })}
    </div>
  );
}
