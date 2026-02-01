'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { RecordCollectionForm } from '@/features/collector/components/record-collection-form';

function Loading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  );
}

export default function RecordCollectionPage() {
  return (
    <div>
      <PageHeader title="Record Collection" backHref="/today" />
      <Suspense fallback={<Loading />}>
        <RecordCollectionForm />
      </Suspense>
    </div>
  );
}
