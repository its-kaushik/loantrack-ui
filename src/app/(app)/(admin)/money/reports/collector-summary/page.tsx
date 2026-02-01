'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CollectorSummaryReport } from '@/features/reports/components/collector-summary-report';

export default function CollectorSummaryPage() {
  return (
    <div>
      <PageHeader title="Collector Summary" backHref="/money" />
      <div className="p-4">
        <CollectorSummaryReport />
      </div>
    </div>
  );
}
