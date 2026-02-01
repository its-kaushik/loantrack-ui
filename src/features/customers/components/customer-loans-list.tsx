'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useCustomerLoans } from '../hooks/use-customer-loans';
import { formatDate } from '@/utils/date';

interface CustomerLoansListProps {
  customerId: string;
}

export function CustomerLoansList({ customerId }: CustomerLoansListProps) {
  const { data: loans, isLoading } = useCustomerLoans(customerId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!loans || loans.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No loans found.</p>;
  }

  return (
    <div className="space-y-1">
      {loans.map((loan) => (
        <Link
          key={loan.id}
          href={`/loans/${loan.id}`}
          className="flex items-center justify-between py-2.5 px-1 border-b last:border-b-0 hover:bg-muted/30 rounded transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-medium">{loan.loanNumber}</p>
              <Badge variant="outline" className="text-[10px]">{loan.loanType}</Badge>
              <StatusBadge status={loan.status} variant="loan" />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(loan.disbursementDate)} • {loan.interestRate}%
            </p>
          </div>
          <p className="text-sm font-semibold flex-shrink-0 ml-3">
            <CurrencyDisplay amount={loan.principalAmount} />
          </p>
        </Link>
      ))}
    </div>
  );
}
