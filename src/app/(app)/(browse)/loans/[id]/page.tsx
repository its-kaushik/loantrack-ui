'use client';

import { use } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoanDetail } from '@/features/loans/hooks/use-loan-detail';
import { useAuthStore } from '@/stores/auth-store';
import { MonthlyLoanDetail } from '@/features/loans/components/monthly-loan-detail';
import { DailyLoanDetail } from '@/features/loans/components/daily-loan-detail';
import type { MonthlyLoanDetail as MonthlyLoanDetailType, DailyLoanDetail as DailyLoanDetailType } from '@/types/entities';

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: loan, isLoading, isError } = useLoanDetail(id);
  const isCollector = useAuthStore((s) => s.user?.role === 'COLLECTOR');

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Loan Detail" backHref="/loans" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div>
        <PageHeader title="Loan Detail" backHref="/loans" />
        <div className="p-4 text-center text-sm text-muted-foreground">
          Failed to load loan details.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Loan Detail" backHref="/loans" />
      {loan.loanType === 'MONTHLY' ? (
        <MonthlyLoanDetail loan={loan as MonthlyLoanDetailType} readOnly={isCollector} />
      ) : (
        <DailyLoanDetail loan={loan as DailyLoanDetailType} readOnly={isCollector} />
      )}
    </div>
  );
}
