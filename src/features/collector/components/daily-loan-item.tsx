'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Phone } from 'lucide-react';
import type { MissedTodayLoan } from '@/lib/api/loans.api';

interface DailyLoanItemProps {
  item: MissedTodayLoan;
}

export function DailyLoanItem({ item }: DailyLoanItemProps) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-start justify-between">
          <Link
            href={`/today/record?loanId=${item.loanId}`}
            className="min-w-0 flex-1"
          >
            <p className="text-sm font-medium truncate">{item.borrowerName}</p>
            <p className="text-xs text-muted-foreground">{item.disbursementDate}</p>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <div className="text-right">
              <p className="text-sm font-semibold">
                <CurrencyDisplay amount={parseFloat(item.dailyPaymentAmount)} />
              </p>
            </div>
            {item.borrowerPhone && (
              <a
                href={`tel:${item.borrowerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full hover:bg-muted"
                aria-label="Call borrower"
              >
                <Phone className="h-4 w-4 text-primary" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
