import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Phone } from 'lucide-react';
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
              <div
                key={item.loanId}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
              >
                <Link href={`/loans/${item.loanId}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.borrowerName}</p>
                  <p className="text-xs text-muted-foreground">
                    <CurrencyDisplay amount={item.interestAmount} /> &middot; Due: {item.dueDate}
                  </p>
                </Link>
                {item.borrowerPhone && (
                  <a
                    href={`tel:${item.borrowerPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-2 p-2 rounded-full text-primary hover:bg-primary/10"
                    aria-label={`Call ${item.borrowerName}`}
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
