import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { EmptyState } from '@/components/shared/empty-state';
import type { MonthlyInterestDueItem } from '../types';

interface MonthlyInterestDueListProps {
  items: MonthlyInterestDueItem[];
}

export function MonthlyInterestDueList({ items }: MonthlyInterestDueListProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly Interest Due ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No interest due"
            description="No monthly loans have interest due today."
          />
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.loanId}
                href={`/loans/${item.loanId}`}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.borrowerName}</p>
                  <p className="text-xs text-muted-foreground">Due: {item.dueDate}</p>
                </div>
                <p className="text-sm font-semibold">
                  <CurrencyDisplay amount={item.interestAmount} />
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
