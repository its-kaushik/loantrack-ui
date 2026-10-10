'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { RecordPaymentForm } from '@/features/transactions/components/record-payment-form';

function RecordPaymentScreen() {
  // ?fix=<transaction id> turns the form into a correction of that entry
  const isFixing = useSearchParams().has('fix');

  return (
    <>
      <PageHeader title={isFixing ? 'Fix Entry' : 'Record Payment'} backHref="/more" />
      <RecordPaymentForm />
    </>
  );
}

export default function RecordPaymentPage() {
  return (
    <div>
      <Suspense>
        <RecordPaymentScreen />
      </Suspense>
    </div>
  );
}
