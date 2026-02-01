'use client';

import { PageHeader } from '@/components/shared/page-header';
import { LoanBookReport } from '@/features/reports/components/loan-book-report';

export default function LoanBookPage() {
  return (
    <div>
      <PageHeader title="Loan Book" backHref="/money" />
      <div className="p-4">
        <LoanBookReport />
      </div>
    </div>
  );
}
