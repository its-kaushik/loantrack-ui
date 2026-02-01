'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { RecordPaymentForm } from '@/features/transactions/components/record-payment-form';

export default function RecordPaymentPage() {
  return (
    <div>
      <PageHeader title="Record Payment" backHref="/more" />
      <Suspense>
        <RecordPaymentForm />
      </Suspense>
    </div>
  );
}
