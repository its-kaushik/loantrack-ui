'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CreateLoanForm } from '@/features/loans/components/create-loan-form';

export default function NewLoanPage() {
  return (
    <div>
      <PageHeader title="New Loan" backHref="/loans" />
      <CreateLoanForm />
    </div>
  );
}
