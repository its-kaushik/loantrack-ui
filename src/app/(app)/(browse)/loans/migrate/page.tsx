'use client';

import { PageHeader } from '@/components/shared/page-header';
import { MigrateLoanForm } from '@/features/loans/components/migrate-loan-form';

export default function MigrateLoanPage() {
  return (
    <div>
      <PageHeader title="Migrate Loan" backHref="/loans" />
      <MigrateLoanForm />
    </div>
  );
}
