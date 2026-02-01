'use client';

import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLoanPaymentStatus } from '../hooks/use-loan-payment-status';
import type { MonthlyPaymentStatus, MonthlyPaymentCycle } from '../types';

interface PaymentStatusTableProps {
  loanId: string;
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatCycle(cycle: MonthlyPaymentCycle): string {
  return `${monthNames[cycle.cycleMonth - 1]} ${cycle.cycleYear}`;
}

function isCurrentCycle(cycle: MonthlyPaymentCycle): boolean {
  const now = new Date();
  return cycle.cycleYear === now.getFullYear() && cycle.cycleMonth === now.getMonth() + 1;
}

export function PaymentStatusTable({ loanId }: PaymentStatusTableProps) {
  const { data, isLoading } = useLoanPaymentStatus(loanId);

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  if (!data || !('cycles' in data)) {
    return null;
  }

  const status = data as MonthlyPaymentStatus;

  if (status.cycles.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No billing cycles yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2 pr-3 font-medium text-muted-foreground">Cycle</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Due</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Paid</th>
            <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Waived</th>
            <th className="py-2 font-medium text-muted-foreground text-center">Settled</th>
          </tr>
        </thead>
        <tbody>
          {status.cycles.map((cycle) => (
            <tr
              key={`${cycle.cycleYear}-${cycle.cycleMonth}`}
              className={cn(
                'border-b last:border-b-0',
                isCurrentCycle(cycle) && 'bg-primary/5',
              )}
            >
              <td className="py-2 pr-3">{formatCycle(cycle)}</td>
              <td className="py-2 pr-3 text-right">
                <CurrencyDisplay amount={cycle.interestDue} />
              </td>
              <td className="py-2 pr-3 text-right">
                <CurrencyDisplay amount={cycle.interestPaid} />
              </td>
              <td className="py-2 pr-3 text-right">
                <CurrencyDisplay amount={cycle.interestWaived} />
              </td>
              <td className="py-2 text-center">
                {cycle.isSettled ? (
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
