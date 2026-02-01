'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImposePenaltyForm } from '@/features/penalties/components/impose-penalty-form';

function Loading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

export default function ImposePenaltyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ImposePenaltyForm />
    </Suspense>
  );
}
