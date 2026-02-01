'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CollectionsToday } from '@/features/collector/components/collections-today';

export default function CollectorTodayPage() {
  return (
    <div>
      <PageHeader title="My Collections Today" />
      <div className="p-4">
        <CollectionsToday />
      </div>
    </div>
  );
}
