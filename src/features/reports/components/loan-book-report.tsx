'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { EmptyState } from '@/components/shared/empty-state';
import { useLoanBook } from '../hooks/use-loan-book';
import { formatDate } from '@/utils/date';
import type { LoanBookItem } from '../types';

const statusColors: Record<string, string> = {
  ACTIVE: 'text-green-700 border-green-200',
  CLOSED: 'text-gray-700 border-gray-200',
  DEFAULTED: 'text-red-700 border-red-200',
  WRITTEN_OFF: 'text-orange-700 border-orange-200',
};

function LoanBookCard({ item }: { item: LoanBookItem }) {
  return (
    <Link href={`/loans/${item.loanId}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="py-3">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-medium">{item.borrowerName}</p>
              <p className="text-xs text-muted-foreground">{item.loanNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                <CurrencyDisplay amount={item.principalAmount} />
              </p>
              <Badge variant="outline" className={`text-[10px] ${statusColors[item.status] ?? ''}`}>
                {item.status}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-2">
            <span>Type: {item.loanType === 'MONTHLY' ? 'Monthly' : 'Daily'}</span>
            <span>Disbursed: {formatDate(item.disbursementDate)}</span>
            <span>
              Outstanding: <CurrencyDisplay amount={item.outstandingAmount} className="text-xs" />
            </span>
            <span>
              Interest: <CurrencyDisplay amount={item.interestEarned} className="text-xs" />
            </span>
            {item.guarantorName && <span className="col-span-2">Guarantor: {item.guarantorName}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function LoanBookReport() {
  const { data, isLoading } = useLoanBook();

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState title="No loans" description="No loans found in the loan book." />
      )}

      {data && data.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">{data.length} loan{data.length !== 1 ? 's' : ''}</p>
          <div className="space-y-2">
            {data.map((item) => (
              <LoanBookCard key={item.loanId} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
