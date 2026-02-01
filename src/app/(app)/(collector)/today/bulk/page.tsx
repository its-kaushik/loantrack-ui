'use client';

import { PageHeader } from '@/components/shared/page-header';
import { BulkCollectionForm } from '@/features/transactions/components/bulk-collection-form';

export default function BulkCollectionPage() {
  return (
    <div>
      <PageHeader title="Bulk Collection" backHref="/today" />
      <BulkCollectionForm />
    </div>
  );
}
