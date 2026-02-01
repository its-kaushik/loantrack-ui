import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import type { Loan } from '@/types/entities';

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="py-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium truncate">{loan.borrowerName}</p>
                <StatusBadge status={loan.status} variant="loan" />
              </div>
              <p className="text-xs text-muted-foreground">{loan.loanNumber}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-sm font-semibold">
                <CurrencyDisplay amount={loan.principalAmount} />
              </p>
              <Badge variant="outline" className="text-[10px] mt-1">
                {loan.loanType}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
